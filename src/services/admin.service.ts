import { db } from "../config/database";
import { users, classes, students } from "../models/schema";
import { eq, count, and, isNull, sql } from "drizzle-orm";

export interface DashboardStats {
  totalStudents: number;
  activeClasses: number;
  totalTeachers: number;
  enrollmentRate: number;
}

export interface TeacherDetails {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  sectionCount: number;
  maxSections: number;
  classes: Array<{
    id: number;
    name: string;
    section: string;
    studentCount: number;
    students: Array<{
      id: number;
      name: string;
      age: number;
    }>;
  }>;
}

export interface UserDetails {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  sectionCount?: number;
}

export class AdminService {
  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    // Get total students count
    const [studentCountResult] = await db
      .select({ count: count() })
      .from(students);
    const totalStudents = studentCountResult.count;

    // Get active classes count
    const [classCountResult] = await db
      .select({ count: count() })
      .from(classes);
    const activeClasses = classCountResult.count;

    // Get total teachers count
    const [teacherCountResult] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, "teacher"));
    const totalTeachers = teacherCountResult.count;

    // Calculate enrollment rate
    const [enrolledStudentsResult] = await db
      .select({ count: count() })
      .from(students)
      .where(eq(students.classId, students.classId)); // This will count all students with a classId
    const enrolledStudents = enrolledStudentsResult.count;

    const enrollmentRate =
      totalStudents > 0
        ? Math.round((enrolledStudents / totalStudents) * 100)
        : 0;

    return {
      totalStudents,
      activeClasses,
      totalTeachers,
      enrollmentRate,
    };
  }

  /**
   * Get all teachers with their classes and students
   */
  static async getTeachersWithDetails(): Promise<TeacherDetails[]> {
    const teachers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.role, "teacher"));

    const teachersWithDetails = await Promise.all(
      teachers.map(async (teacher) => {
        // Get classes taught by this teacher
        const teacherClasses = await db
          .select({
            id: classes.id,
            name: classes.name,
            section: classes.section,
          })
          .from(classes)
          .where(eq(classes.teacherId, teacher.id));

        // Get students for each class
        const classesWithStudents = await Promise.all(
          teacherClasses.map(async (classItem) => {
            const classStudents = await db
              .select({
                id: students.id,
                name: students.name,
                age: students.age,
              })
              .from(students)
              .where(eq(students.classId, classItem.id));

            return {
              ...classItem,
              studentCount: classStudents.length,
              students: classStudents,
            };
          })
        );

        return {
          ...teacher,
          createdAt: teacher.createdAt.toISOString(),
          classes: classesWithStudents,
          sectionCount: teacherClasses.length,
          maxSections: 5,
        };
      })
    );

    return teachersWithDetails;
  }

  /**
   * Get all users
   */
  static async getAllUsers(): Promise<UserDetails[]> {
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(users.role, users.name);

    return allUsers.map((user) => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
    }));
  }

  /**
   * Get all available teachers (not at maximum section limit of 5)
   */
  static async getAvailableTeachers(): Promise<UserDetails[]> {
    // First get all teachers
    const allTeachers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.role, "teacher"))
      .orderBy(users.name);

    // Get section count for each teacher
    const teachersWithSectionCount = await Promise.all(
      allTeachers.map(async (teacher) => {
        const teacherClasses = await db
          .select()
          .from(classes)
          .where(eq(classes.teacherId, teacher.id));

        return {
          ...teacher,
          sectionCount: teacherClasses.length,
        };
      })
    );

    // Filter out teachers who have reached the maximum of 5 sections
    const availableTeachers = teachersWithSectionCount.filter(
      (teacher) => teacher.sectionCount < 5
    );

    return availableTeachers.map((teacher) => ({
      ...teacher,
      createdAt: teacher.createdAt.toISOString(),
    }));
  }
}

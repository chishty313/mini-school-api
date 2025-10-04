import { db } from "../config/database";
import { classes, students, users } from "../models/schema";
import { eq, count, and, desc } from "drizzle-orm";

export interface TeacherDashboardStats {
  totalClasses: number;
  totalStudents: number;
  pendingTasks: number;
  completedThisWeek: number;
}

export interface TeacherActivity {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
}

export class TeacherService {
  /**
   * Get teacher dashboard statistics
   */
  static async getDashboardStats(
    teacherId: number
  ): Promise<TeacherDashboardStats> {
    // Get total classes for this teacher
    const [classCountResult] = await db
      .select({ count: count() })
      .from(classes)
      .where(eq(classes.teacherId, teacherId));

    const totalClasses = classCountResult.count;

    // Get total students across all teacher's classes
    const [studentCountResult] = await db
      .select({ count: count() })
      .from(students)
      .innerJoin(classes, eq(students.classId, classes.id))
      .where(eq(classes.teacherId, teacherId));

    const totalStudents = studentCountResult.count;

    // For now, return placeholder values for pending tasks and completed this week
    // These would be implemented when assignment/grading features are added
    const pendingTasks = 0;
    const completedThisWeek = 0;

    return {
      totalClasses,
      totalStudents,
      pendingTasks,
      completedThisWeek,
    };
  }

  /**
   * Get teacher's recent activities
   */
  static async getRecentActivities(
    teacherId: number
  ): Promise<TeacherActivity[]> {
    try {
      // Get recent students from teacher's classes
      const recentStudents = await db
        .select({
          id: students.id,
          name: students.name,
          createdAt: students.createdAt,
          className: classes.name,
          classSection: classes.section,
        })
        .from(students)
        .innerJoin(classes, eq(students.classId, classes.id))
        .where(eq(classes.teacherId, teacherId))
        .orderBy(desc(students.createdAt))
        .limit(5);

      // Get recent classes created by this teacher
      const recentClasses = await db
        .select({
          id: classes.id,
          name: classes.name,
          section: classes.section,
          createdAt: classes.createdAt,
        })
        .from(classes)
        .where(eq(classes.teacherId, teacherId))
        .orderBy(desc(classes.createdAt))
        .limit(3);

      const activities: TeacherActivity[] = [];

      // Add student enrollment activities
      recentStudents.forEach((student, index) => {
        activities.push({
          id: `student-${student.id}`,
          type: "enrollment",
          title: "New student enrolled",
          message: `${student.name} joined ${student.className} - ${student.classSection}`,
          time: new Date(student.createdAt).toLocaleTimeString(),
        });
      });

      // Add class creation activities
      recentClasses.forEach((cls, index) => {
        activities.push({
          id: `class-${cls.id}`,
          type: "class",
          title: "Class created",
          message: `${cls.name} - ${cls.section} was created`,
          time: new Date(cls.createdAt).toLocaleTimeString(),
        });
      });

      // Sort by time (most recent first) and return top 5
      return activities
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 5);
    } catch (error) {
      console.error("Error getting teacher activities:", error);
      return [];
    }
  }

  /**
   * Get teacher's classes with student counts
   */
  static async getTeacherClasses(teacherId: number) {
    const teacherClasses = await db
      .select({
        id: classes.id,
        name: classes.name,
        section: classes.section,
        createdAt: classes.createdAt,
        updatedAt: classes.updatedAt,
        studentCount: count(students.id),
      })
      .from(classes)
      .leftJoin(students, eq(classes.id, students.classId))
      .where(eq(classes.teacherId, teacherId))
      .groupBy(
        classes.id,
        classes.name,
        classes.section,
        classes.createdAt,
        classes.updatedAt
      )
      .orderBy(classes.name, classes.section);

    return teacherClasses;
  }
}

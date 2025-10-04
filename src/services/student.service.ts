import { db } from "../config/database";
import {
  students,
  classes,
  users,
  Student,
  NewStudent,
} from "../models/schema";
import { eq, desc, asc, count, and } from "drizzle-orm";

export interface StudentWithClass extends Student {
  class?: {
    id: number;
    name: string;
    section: string;
  } | null;
}

export interface PaginatedStudents {
  students: StudentWithClass[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalStudents: number;
    limit: number;
  };
}

export class StudentService {
  /**
   * Create a new student
   */
  static async createStudent(studentData: {
    name: string;
    age: number;
    classId?: number | null;
  }): Promise<StudentWithClass> {
    // If classId is provided, verify the class exists and check student limit
    if (studentData.classId) {
      const [existingClass] = await db
        .select()
        .from(classes)
        .where(eq(classes.id, studentData.classId))
        .limit(1);

      if (!existingClass) {
        throw new Error("Specified class does not exist");
      }

      // Check if the class section already has 5 students (limit per section)
      const [studentCount] = await db
        .select({ count: count(students.id) })
        .from(students)
        .where(eq(students.classId, studentData.classId));

      if (studentCount && studentCount.count >= 5) {
        throw new Error(
          `Class section "${existingClass.name} - ${existingClass.section}" is full. Maximum 5 students allowed per section.`
        );
      }
    }

    const newStudent: NewStudent = {
      name: studentData.name,
      age: studentData.age,
      classId: studentData.classId || null,
    };

    const [createdStudent] = await db
      .insert(students)
      .values(newStudent)
      .returning();

    // Fetch student with class details
    return this.getStudentById(createdStudent.id);
  }

  /**
   * Get paginated list of students
   */
  static async getStudents(
    options: {
      page?: number;
      limit?: number;
      classId?: number;
    } = {}
  ): Promise<PaginatedStudents> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const offset = (page - 1) * limit;

    // Build where condition
    const whereCondition = options.classId
      ? eq(students.classId, options.classId)
      : undefined;

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(students)
      .where(whereCondition);

    const totalStudents = totalResult.count;
    const totalPages = Math.ceil(totalStudents / limit);

    // Get students with class details
    const studentsList = await db
      .select({
        id: students.id,
        name: students.name,
        age: students.age,
        classId: students.classId,
        createdAt: students.createdAt,
        updatedAt: students.updatedAt,
        class: {
          id: classes.id,
          name: classes.name,
          section: classes.section,
        },
      })
      .from(students)
      .leftJoin(classes, eq(students.classId, classes.id))
      .where(whereCondition)
      .orderBy(asc(students.name))
      .limit(limit)
      .offset(offset);

    const studentsWithClass: StudentWithClass[] = studentsList.map(
      (student) => ({
        id: student.id,
        name: student.name,
        age: student.age,
        classId: student.classId,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
        class: student.class?.id ? student.class : null,
      })
    );

    return {
      students: studentsWithClass,
      pagination: {
        currentPage: page,
        totalPages,
        totalStudents,
        limit,
      },
    };
  }

  /**
   * Get student by ID
   */
  static async getStudentById(id: number): Promise<StudentWithClass> {
    const [student] = await db
      .select({
        id: students.id,
        name: students.name,
        age: students.age,
        classId: students.classId,
        createdAt: students.createdAt,
        updatedAt: students.updatedAt,
        class: {
          id: classes.id,
          name: classes.name,
          section: classes.section,
        },
      })
      .from(students)
      .leftJoin(classes, eq(students.classId, classes.id))
      .where(eq(students.id, id))
      .limit(1);

    if (!student) {
      throw new Error("Student not found");
    }

    return {
      id: student.id,
      name: student.name,
      age: student.age,
      classId: student.classId,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
      class: student.class?.id ? student.class : null,
    };
  }

  /**
   * Update student
   */
  static async updateStudent(
    id: number,
    updateData: {
      name?: string;
      age?: number;
      classId?: number | null;
    }
  ): Promise<StudentWithClass> {
    // Check if student exists
    const existingStudent = await this.getStudentById(id);

    // If classId is being updated, verify the class exists and check student limit
    if (updateData.classId !== undefined && updateData.classId !== null) {
      const [existingClass] = await db
        .select()
        .from(classes)
        .where(eq(classes.id, updateData.classId))
        .limit(1);

      if (!existingClass) {
        throw new Error("Specified class does not exist");
      }

      // Only check limit if student is moving to a different class
      if (existingStudent.classId !== updateData.classId) {
        // Check if the target class section already has 5 students (limit per section)
        const [studentCount] = await db
          .select({ count: count(students.id) })
          .from(students)
          .where(eq(students.classId, updateData.classId));

        if (studentCount && studentCount.count >= 5) {
          throw new Error(
            `Class section "${existingClass.name} - ${existingClass.section}" is full. Maximum 5 students allowed per section.`
          );
        }
      }
    }

    // Update student
    const [updatedStudent] = await db
      .update(students)
      .set({
        ...updateData,
        classId:
          updateData.classId === undefined ? undefined : updateData.classId,
        updatedAt: new Date(),
      })
      .where(eq(students.id, id))
      .returning();

    if (!updatedStudent) {
      throw new Error("Failed to update student");
    }

    // Return updated student with class details
    return this.getStudentById(id);
  }

  /**
   * Delete student
   */
  static async deleteStudent(id: number): Promise<void> {
    // Check if student exists
    await this.getStudentById(id);

    const [deletedStudent] = await db
      .delete(students)
      .where(eq(students.id, id))
      .returning();

    if (!deletedStudent) {
      throw new Error("Failed to delete student");
    }
  }

  /**
   * Get students by class ID
   */
  static async getStudentsByClassId(
    classId: number
  ): Promise<StudentWithClass[]> {
    const result = await this.getStudents({ classId, limit: 100 });
    return result.students;
  }

  /**
   * Get classes for a specific student (by user ID)
   */
  static async getStudentClasses(userId: number): Promise<any[]> {
    // First, get the user information to find the student by name/email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error("User not found");
    }

    // Find student record by matching name (since there's no direct user-student relationship)
    // Use exact name match to avoid confusion with similar names
    // Order by ID descending to get the most recent record if there are duplicates
    const [studentRecord] = await db
      .select()
      .from(students)
      .where(eq(students.name, user.name))
      .orderBy(desc(students.id))
      .limit(1);

    if (!studentRecord) {
      // Return empty array if no student record found
      return [];
    }

    // If student is not enrolled in any class, return empty array
    if (!studentRecord.classId) {
      return [];
    }

    // Get the class for this student with teacher details and student count
    const studentClasses = await db
      .select({
        id: classes.id,
        name: classes.name,
        section: classes.section,
        teacherId: classes.teacherId,
        createdAt: classes.createdAt,
        updatedAt: classes.updatedAt,
        studentCount: count(students.id),
        teacher: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(classes)
      .leftJoin(users, eq(classes.teacherId, users.id))
      .leftJoin(students, eq(students.classId, classes.id))
      .where(eq(classes.id, studentRecord.classId))
      .groupBy(classes.id, users.id);

    return studentClasses;
  }
}

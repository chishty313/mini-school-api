import { db } from "../config/database";
import { classes, students, users, Class, NewClass } from "../models/schema";
import { eq, asc, count, and, sql } from "drizzle-orm";

export interface ClassWithStudentCount extends Class {
  studentCount: number;
  teacher?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export interface ClassWithStudents extends Class {
  students: {
    id: number;
    name: string;
    age: number;
  }[];
}

export class ClassService {
  /**
   * Create a new class
   */
  static async createClass(classData: {
    name: string;
    section: string;
    teacherId?: number;
  }): Promise<Class> {
    // Check if class with same name and section already exists
    const [existingClass] = await db
      .select()
      .from(classes)
      .where(eq(classes.name, classData.name))
      .limit(1);

    if (existingClass && existingClass.section === classData.section) {
      throw new Error(
        `Class ${classData.name} - Section ${classData.section} already exists`
      );
    }

    // If teacherId is provided, validate that the user exists and is a teacher
    if (classData.teacherId) {
      const [teacher] = await db
        .select()
        .from(users)
        .where(
          and(eq(users.id, classData.teacherId), eq(users.role, "teacher"))
        )
        .limit(1);

      if (!teacher) {
        throw new Error(
          "Invalid teacher ID. User must exist and have teacher role."
        );
      }
    }

    const newClass: NewClass = {
      name: classData.name,
      section: classData.section,
      teacherId: classData.teacherId || null,
    };

    const [createdClass] = await db
      .insert(classes)
      .values(newClass)
      .returning();

    if (!createdClass) {
      throw new Error("Failed to create class");
    }

    return createdClass;
  }

  /**
   * Get all classes with student count and teacher info
   */
  static async getClasses(
    teacherId?: number
  ): Promise<ClassWithStudentCount[]> {
    const classList = await db
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
      .leftJoin(students, eq(classes.id, students.classId))
      .leftJoin(users, eq(classes.teacherId, users.id))
      .where(teacherId ? eq(classes.teacherId, teacherId) : sql`1=1`)
      .groupBy(
        classes.id,
        classes.name,
        classes.section,
        classes.teacherId,
        classes.createdAt,
        classes.updatedAt,
        users.id,
        users.name,
        users.email
      )
      .orderBy(asc(classes.name), asc(classes.section));

    return classList.map((cls) => ({
      ...cls,
      teacher: cls.teacher?.id ? cls.teacher : null,
    }));
  }

  /**
   * Get class by ID
   */
  static async getClassById(id: number): Promise<Class> {
    const [foundClass] = await db
      .select()
      .from(classes)
      .where(eq(classes.id, id))
      .limit(1);

    if (!foundClass) {
      throw new Error("Class not found");
    }

    return foundClass;
  }

  /**
   * Get class with students
   */
  static async getClassWithStudents(id: number): Promise<ClassWithStudents> {
    // First get the class
    const foundClass = await this.getClassById(id);

    // Then get all students in this class
    const classStudents = await db
      .select({
        id: students.id,
        name: students.name,
        age: students.age,
        classId: students.classId,
        createdAt: students.createdAt,
        updatedAt: students.updatedAt,
      })
      .from(students)
      .where(eq(students.classId, id))
      .orderBy(asc(students.name));

    return {
      ...foundClass,
      students: classStudents,
    };
  }

  /**
   * Update class
   */
  static async updateClass(
    id: number,
    updateData: {
      name?: string;
      section?: string;
    }
  ): Promise<Class> {
    // Check if class exists
    await this.getClassById(id);

    // If updating name/section, check for duplicates
    if (updateData.name || updateData.section) {
      const [existingClass] = await db
        .select()
        .from(classes)
        .where(eq(classes.id, id))
        .limit(1);

      const newName = updateData.name || existingClass!.name;
      const newSection = updateData.section || existingClass!.section;

      // Check if another class has the same name and section combination
      const [duplicateClass] = await db
        .select()
        .from(classes)
        .where(eq(classes.name, newName))
        .limit(2); // Get up to 2 to check if there's another one

      if (
        duplicateClass &&
        duplicateClass.id !== id &&
        duplicateClass.section === newSection
      ) {
        throw new Error(
          `Class ${newName} - Section ${newSection} already exists`
        );
      }
    }

    const [updatedClass] = await db
      .update(classes)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(classes.id, id))
      .returning();

    if (!updatedClass) {
      throw new Error("Failed to update class");
    }

    return updatedClass;
  }

  /**
   * Delete class
   */
  static async deleteClass(id: number): Promise<void> {
    // Check if class exists
    await this.getClassById(id);

    // Check if class has students
    const [studentCount] = await db
      .select({ count: count() })
      .from(students)
      .where(eq(students.classId, id));

    if (studentCount.count > 0) {
      throw new Error(
        "Cannot delete class with enrolled students. Please move students to another class first."
      );
    }

    const [deletedClass] = await db
      .delete(classes)
      .where(eq(classes.id, id))
      .returning();

    if (!deletedClass) {
      throw new Error("Failed to delete class");
    }
  }

  /**
   * Enroll student to class
   */
  static async enrollStudent(
    classId: number,
    studentId: number
  ): Promise<void> {
    // Verify class exists
    const classInfo = await this.getClassById(classId);

    // Verify student exists
    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, studentId))
      .limit(1);

    if (!student) {
      throw new Error("Student not found");
    }

    // Check if student is already enrolled in this class
    if (student.classId === classId) {
      throw new Error("Student is already enrolled in this class");
    }

    // Check if the class section already has 5 students (limit per section)
    const [studentCount] = await db
      .select({ count: count(students.id) })
      .from(students)
      .where(eq(students.classId, classId));

    if (studentCount && studentCount.count >= 5) {
      throw new Error(
        `Class section "${classInfo.name} - ${classInfo.section}" is full. Maximum 5 students allowed per section.`
      );
    }

    // Update student's class
    const [updatedStudent] = await db
      .update(students)
      .set({
        classId: classId,
        updatedAt: new Date(),
      })
      .where(eq(students.id, studentId))
      .returning();

    if (!updatedStudent) {
      throw new Error("Failed to enroll student");
    }
  }

  /**
   * Remove student from class
   */
  static async removeStudentFromClass(studentId: number): Promise<void> {
    // Verify student exists
    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, studentId))
      .limit(1);

    if (!student) {
      throw new Error("Student not found");
    }

    if (!student.classId) {
      throw new Error("Student is not enrolled in any class");
    }

    // Remove student from class
    const [updatedStudent] = await db
      .update(students)
      .set({
        classId: null,
        updatedAt: new Date(),
      })
      .where(eq(students.id, studentId))
      .returning();

    if (!updatedStudent) {
      throw new Error("Failed to remove student from class");
    }
  }

  /**
   * Assign teacher to class (Admin only)
   */
  static async assignTeacherToClass(
    classId: number,
    teacherId: number
  ): Promise<Class> {
    // Check if class exists
    await this.getClassById(classId);

    // Verify teacher exists and is actually a teacher
    const [teacher] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, teacherId), eq(users.role, "teacher")))
      .limit(1);

    if (!teacher) {
      throw new Error("Teacher not found or user is not a teacher");
    }

    // Check if teacher already has the maximum number of sections (5)
    const teacherClasses = await db
      .select()
      .from(classes)
      .where(eq(classes.teacherId, teacherId));

    if (teacherClasses.length >= 5) {
      throw new Error("Teacher cannot be assigned to more than 5 sections");
    }

    // Update class with teacher assignment
    const [updatedClass] = await db
      .update(classes)
      .set({
        teacherId: teacherId,
        updatedAt: new Date(),
      })
      .where(eq(classes.id, classId))
      .returning();

    if (!updatedClass) {
      throw new Error("Failed to assign teacher to class");
    }

    return updatedClass;
  }

  /**
   * Remove teacher from class (Admin only)
   */
  static async removeTeacherFromClass(classId: number): Promise<Class> {
    // Check if class exists
    await this.getClassById(classId);

    // Remove teacher from class
    const [updatedClass] = await db
      .update(classes)
      .set({
        teacherId: null,
        updatedAt: new Date(),
      })
      .where(eq(classes.id, classId))
      .returning();

    if (!updatedClass) {
      throw new Error("Failed to remove teacher from class");
    }

    return updatedClass;
  }
}

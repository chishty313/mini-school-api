import { db } from '../config/database';
import { classes, students, Class, NewClass } from '../models/schema';
import { eq, asc, count } from 'drizzle-orm';

export interface ClassWithStudentCount extends Class {
  studentCount: number;
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
  }): Promise<Class> {
    
    // Check if class with same name and section already exists
    const [existingClass] = await db
      .select()
      .from(classes)
      .where(eq(classes.name, classData.name))
      .limit(1);

    if (existingClass && existingClass.section === classData.section) {
      throw new Error(`Class ${classData.name} - Section ${classData.section} already exists`);
    }

    const newClass: NewClass = {
      name: classData.name,
      section: classData.section,
    };

    const [createdClass] = await db.insert(classes).values(newClass).returning();

    if (!createdClass) {
      throw new Error('Failed to create class');
    }

    return createdClass;
  }

  /**
   * Get all classes with student count
   */
  static async getClasses(): Promise<ClassWithStudentCount[]> {
    const classList = await db
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
      .groupBy(classes.id, classes.name, classes.section, classes.createdAt, classes.updatedAt)
      .orderBy(asc(classes.name), asc(classes.section));

    return classList;
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
      throw new Error('Class not found');
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

      if (duplicateClass && 
          duplicateClass.id !== id && 
          duplicateClass.section === newSection) {
        throw new Error(`Class ${newName} - Section ${newSection} already exists`);
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
      throw new Error('Failed to update class');
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
      throw new Error('Cannot delete class with enrolled students. Please move students to another class first.');
    }

    const [deletedClass] = await db
      .delete(classes)
      .where(eq(classes.id, id))
      .returning();

    if (!deletedClass) {
      throw new Error('Failed to delete class');
    }
  }

  /**
   * Enroll student to class
   */
  static async enrollStudent(classId: number, studentId: number): Promise<void> {
    
    // Verify class exists
    await this.getClassById(classId);

    // Verify student exists
    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, studentId))
      .limit(1);

    if (!student) {
      throw new Error('Student not found');
    }

    // Check if student is already enrolled in this class
    if (student.classId === classId) {
      throw new Error('Student is already enrolled in this class');
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
      throw new Error('Failed to enroll student');
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
      throw new Error('Student not found');
    }

    if (!student.classId) {
      throw new Error('Student is not enrolled in any class');
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
      throw new Error('Failed to remove student from class');
    }
  }
}
import { db } from '../config/database';
import { students, classes, Student, NewStudent } from '../models/schema';
import { eq, desc, asc, count, and } from 'drizzle-orm';

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
    classId?: number;
  }): Promise<StudentWithClass> {
    
    // If classId is provided, verify the class exists
    if (studentData.classId) {
      const [existingClass] = await db.select().from(classes).where(eq(classes.id, studentData.classId)).limit(1);
      
      if (!existingClass) {
        throw new Error('Specified class does not exist');
      }
    }

    const newStudent: NewStudent = {
      name: studentData.name,
      age: studentData.age,
      classId: studentData.classId || null,
    };

    const [createdStudent] = await db.insert(students).values(newStudent).returning();

    // Fetch student with class details
    return this.getStudentById(createdStudent.id);
  }

  /**
   * Get paginated list of students
   */
  static async getStudents(options: {
    page?: number;
    limit?: number;
    classId?: number;
  } = {}): Promise<PaginatedStudents> {
    
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

    const studentsWithClass: StudentWithClass[] = studentsList.map(student => ({
      id: student.id,
      name: student.name,
      age: student.age,
      classId: student.classId,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
      class: student.class?.id ? student.class : null,
    }));

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
      throw new Error('Student not found');
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
      classId?: number;
    }
  ): Promise<StudentWithClass> {
    
    // Check if student exists
    const existingStudent = await this.getStudentById(id);

    // If classId is being updated, verify the class exists
    if (updateData.classId !== undefined && updateData.classId !== null) {
      const [existingClass] = await db.select().from(classes).where(eq(classes.id, updateData.classId)).limit(1);
      
      if (!existingClass) {
        throw new Error('Specified class does not exist');
      }
    }

    // Update student
    const [updatedStudent] = await db
      .update(students)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(students.id, id))
      .returning();

    if (!updatedStudent) {
      throw new Error('Failed to update student');
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
      throw new Error('Failed to delete student');
    }
  }

  /**
   * Get students by class ID
   */
  static async getStudentsByClassId(classId: number): Promise<StudentWithClass[]> {
    const result = await this.getStudents({ classId, limit: 100 });
    return result.students;
  }
}
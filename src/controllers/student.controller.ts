import { Request, Response } from 'express';
import { StudentService } from '../services/student.service';
import { CreateStudentDto, UpdateStudentDto, GetStudentsQueryDto } from '../validators/student.dto';

export class StudentController {
  /**
   * Create a new student
   * POST /students
   * Access: Admin only
   */
  static async createStudent(req: Request, res: Response): Promise<void> {
    try {
      const { name, age, classId } = req.body as CreateStudentDto;

      const student = await StudentService.createStudent({
        name,
        age,
        classId,
      });

      res.status(201).json({
        message: 'Student created successfully',
        data: { student },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('does not exist')) {
          res.status(400).json({
            error: 'Student creation failed',
            message: error.message,
          });
        } else {
          res.status(500).json({
            error: 'Student creation failed',
            message: 'An unexpected error occurred',
          });
        }
      } else {
        res.status(500).json({
          error: 'Student creation failed',
          message: 'An unexpected error occurred',
        });
      }
    }
  }

  /**
   * Get all students (with pagination)
   * GET /students
   * Access: Admin and Teacher
   */
  static async getStudents(req: Request, res: Response): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const classId = req.query.classId ? parseInt(req.query.classId as string) : undefined;

      // Basic validation
      if (page && (isNaN(page) || page < 1)) {
        res.status(400).json({
          error: 'Invalid query parameter',
          message: 'Page must be a positive number',
        });
        return;
      }

      if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
        res.status(400).json({
          error: 'Invalid query parameter',
          message: 'Limit must be between 1 and 100',
        });
        return;
      }

      if (classId && (isNaN(classId) || classId < 1)) {
        res.status(400).json({
          error: 'Invalid query parameter',
          message: 'Class ID must be a positive number',
        });
        return;
      }

      const result = await StudentService.getStudents({
        page,
        limit,
        classId,
      });

      res.status(200).json({
        message: 'Students retrieved successfully',
        data: result,
      });
    } catch (error) {
      console.error('Get students error:', error);
      res.status(500).json({
        error: 'Failed to retrieve students',
        message: 'An unexpected error occurred',
      });
    }
  }

  /**
   * Get student by ID
   * GET /students/:id
   * Access: Admin and Teacher
   */
  static async getStudentById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id) || id < 1) {
        res.status(400).json({
          error: 'Invalid student ID',
          message: 'Student ID must be a positive number',
        });
        return;
      }

      const student = await StudentService.getStudentById(id);

      res.status(200).json({
        message: 'Student retrieved successfully',
        data: { student },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Student not found') {
          res.status(404).json({
            error: 'Student not found',
            message: 'Student with the specified ID does not exist',
          });
        } else {
          res.status(500).json({
            error: 'Failed to retrieve student',
            message: 'An unexpected error occurred',
          });
        }
      } else {
        res.status(500).json({
          error: 'Failed to retrieve student',
          message: 'An unexpected error occurred',
        });
      }
    }
  }

  /**
   * Update student
   * PUT /students/:id
   * Access: Admin only
   */
  static async updateStudent(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id) || id < 1) {
        res.status(400).json({
          error: 'Invalid student ID',
          message: 'Student ID must be a positive number',
        });
        return;
      }

      const { name, age, classId } = req.body as UpdateStudentDto;

      const student = await StudentService.updateStudent(id, {
        name,
        age,
        classId,
      });

      res.status(200).json({
        message: 'Student updated successfully',
        data: { student },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Student not found') {
          res.status(404).json({
            error: 'Student not found',
            message: 'Student with the specified ID does not exist',
          });
        } else if (error.message.includes('does not exist')) {
          res.status(400).json({
            error: 'Student update failed',
            message: error.message,
          });
        } else {
          res.status(500).json({
            error: 'Student update failed',
            message: 'An unexpected error occurred',
          });
        }
      } else {
        res.status(500).json({
          error: 'Student update failed',
          message: 'An unexpected error occurred',
        });
      }
    }
  }

  /**
   * Delete student
   * DELETE /students/:id
   * Access: Admin only
   */
  static async deleteStudent(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id) || id < 1) {
        res.status(400).json({
          error: 'Invalid student ID',
          message: 'Student ID must be a positive number',
        });
        return;
      }

      await StudentService.deleteStudent(id);

      res.status(200).json({
        message: 'Student deleted successfully',
        data: { deletedStudentId: id },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Student not found') {
          res.status(404).json({
            error: 'Student not found',
            message: 'Student with the specified ID does not exist',
          });
        } else {
          res.status(500).json({
            error: 'Student deletion failed',
            message: 'An unexpected error occurred',
          });
        }
      } else {
        res.status(500).json({
          error: 'Student deletion failed',
          message: 'An unexpected error occurred',
        });
      }
    }
  }
}
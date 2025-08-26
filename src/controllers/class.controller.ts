import { Request, Response } from 'express';
import { ClassService } from '../services/class.service';
import { CreateClassDto, UpdateClassDto, EnrollStudentDto } from '../validators/class.dto';

export class ClassController {
  /**
   * Create a new class
   * POST /classes
   * Access: Admin only
   */
  static async createClass(req: Request, res: Response): Promise<void> {
    try {
      const { name, section } = req.body as CreateClassDto;

      const newClass = await ClassService.createClass({
        name,
        section,
      });

      res.status(201).json({
        message: 'Class created successfully',
        data: { class: newClass },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          res.status(409).json({
            error: 'Class creation failed',
            message: error.message,
          });
        } else {
          res.status(500).json({
            error: 'Class creation failed',
            message: 'An unexpected error occurred',
          });
        }
      } else {
        res.status(500).json({
          error: 'Class creation failed',
          message: 'An unexpected error occurred',
        });
      }
    }
  }

  /**
   * Get all classes
   * GET /classes
   * Access: Admin and Teacher
   */
  static async getClasses(req: Request, res: Response): Promise<void> {
    try {
      const classes = await ClassService.getClasses();

      res.status(200).json({
        message: 'Classes retrieved successfully',
        data: { classes },
      });
    } catch (error) {
      console.error('Get classes error:', error);
      res.status(500).json({
        error: 'Failed to retrieve classes',
        message: 'An unexpected error occurred',
      });
    }
  }

  /**
   * Get class by ID
   * GET /classes/:id
   * Access: Admin and Teacher
   */
  static async getClassById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id) || id < 1) {
        res.status(400).json({
          error: 'Invalid class ID',
          message: 'Class ID must be a positive number',
        });
        return;
      }

      const classData = await ClassService.getClassById(id);

      res.status(200).json({
        message: 'Class retrieved successfully',
        data: { class: classData },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Class not found') {
          res.status(404).json({
            error: 'Class not found',
            message: 'Class with the specified ID does not exist',
          });
        } else {
          res.status(500).json({
            error: 'Failed to retrieve class',
            message: 'An unexpected error occurred',
          });
        }
      } else {
        res.status(500).json({
          error: 'Failed to retrieve class',
          message: 'An unexpected error occurred',
        });
      }
    }
  }

  /**
   * Get students of a class
   * GET /classes/:id/students
   * Access: Admin and Teacher
   */
  static async getClassStudents(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id) || id < 1) {
        res.status(400).json({
          error: 'Invalid class ID',
          message: 'Class ID must be a positive number',
        });
        return;
      }

      const classWithStudents = await ClassService.getClassWithStudents(id);

      res.status(200).json({
        message: 'Class students retrieved successfully',
        data: {
          class: {
            id: classWithStudents.id,
            name: classWithStudents.name,
            section: classWithStudents.section,
            createdAt: classWithStudents.createdAt,
            updatedAt: classWithStudents.updatedAt,
          },
          students: classWithStudents.students,
          totalStudents: classWithStudents.students.length,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Class not found') {
          res.status(404).json({
            error: 'Class not found',
            message: 'Class with the specified ID does not exist',
          });
        } else {
          res.status(500).json({
            error: 'Failed to retrieve class students',
            message: 'An unexpected error occurred',
          });
        }
      } else {
        res.status(500).json({
          error: 'Failed to retrieve class students',
          message: 'An unexpected error occurred',
        });
      }
    }
  }

  /**
   * Update class
   * PUT /classes/:id
   * Access: Admin only
   */
  static async updateClass(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id) || id < 1) {
        res.status(400).json({
          error: 'Invalid class ID',
          message: 'Class ID must be a positive number',
        });
        return;
      }

      const { name, section } = req.body as UpdateClassDto;

      const updatedClass = await ClassService.updateClass(id, {
        name,
        section,
      });

      res.status(200).json({
        message: 'Class updated successfully',
        data: { class: updatedClass },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Class not found') {
          res.status(404).json({
            error: 'Class not found',
            message: 'Class with the specified ID does not exist',
          });
        } else if (error.message.includes('already exists')) {
          res.status(409).json({
            error: 'Class update failed',
            message: error.message,
          });
        } else {
          res.status(500).json({
            error: 'Class update failed',
            message: 'An unexpected error occurred',
          });
        }
      } else {
        res.status(500).json({
          error: 'Class update failed',
          message: 'An unexpected error occurred',
        });
      }
    }
  }

  /**
   * Delete class
   * DELETE /classes/:id
   * Access: Admin only
   */
  static async deleteClass(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id) || id < 1) {
        res.status(400).json({
          error: 'Invalid class ID',
          message: 'Class ID must be a positive number',
        });
        return;
      }

      await ClassService.deleteClass(id);

      res.status(200).json({
        message: 'Class deleted successfully',
        data: { deletedClassId: id },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Class not found') {
          res.status(404).json({
            error: 'Class not found',
            message: 'Class with the specified ID does not exist',
          });
        } else if (error.message.includes('Cannot delete class with enrolled students')) {
          res.status(400).json({
            error: 'Class deletion failed',
            message: error.message,
          });
        } else {
          res.status(500).json({
            error: 'Class deletion failed',
            message: 'An unexpected error occurred',
          });
        }
      } else {
        res.status(500).json({
          error: 'Class deletion failed',
          message: 'An unexpected error occurred',
        });
      }
    }
  }

  /**
   * Enroll student to class
   * POST /classes/:id/enroll
   * Access: Admin and Teacher
   */
  static async enrollStudent(req: Request, res: Response): Promise<void> {
    try {
      const classId = parseInt(req.params.id);
      const { studentId } = req.body as EnrollStudentDto;

      if (isNaN(classId) || classId < 1) {
        res.status(400).json({
          error: 'Invalid class ID',
          message: 'Class ID must be a positive number',
        });
        return;
      }

      await ClassService.enrollStudent(classId, studentId);

      res.status(200).json({
        message: 'Student enrolled successfully',
        data: {
          classId,
          studentId,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Class not found' || error.message === 'Student not found') {
          res.status(404).json({
            error: 'Enrollment failed',
            message: error.message,
          });
        } else if (error.message.includes('already enrolled')) {
          res.status(409).json({
            error: 'Enrollment failed',
            message: error.message,
          });
        } else {
          res.status(500).json({
            error: 'Enrollment failed',
            message: 'An unexpected error occurred',
          });
        }
      } else {
        res.status(500).json({
          error: 'Enrollment failed',
          message: 'An unexpected error occurred',
        });
      }
    }
  }
}
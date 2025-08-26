import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { validateBody } from '../middleware/validation';
import { authAndRequireRoles } from '../middleware/auth';
import { CreateStudentDto, UpdateStudentDto } from '../validators/student.dto';

const router = Router();

// POST /students - Create new student (Admin only)
router.post(
  '/',
  ...authAndRequireRoles('admin'),
  validateBody(CreateStudentDto),
  StudentController.createStudent
);

// GET /students - Get all students with pagination (Admin and Teacher)
router.get(
  '/',
  ...authAndRequireRoles('admin', 'teacher'),
  StudentController.getStudents
);

// GET /students/:id - Get student by ID (Admin and Teacher)
router.get(
  '/:id',
  ...authAndRequireRoles('admin', 'teacher'),
  StudentController.getStudentById
);

// PUT /students/:id - Update student (Admin only)
router.put(
  '/:id',
  ...authAndRequireRoles('admin'),
  validateBody(UpdateStudentDto),
  StudentController.updateStudent
);

// DELETE /students/:id - Delete student (Admin only)
router.delete(
  '/:id',
  ...authAndRequireRoles('admin'),
  StudentController.deleteStudent
);

export default router;
import { Router } from "express";
import { ClassController } from "../controllers/class.controller";
import { validateBody } from "../middleware/validation";
import { authAndRequireRoles } from "../middleware/auth";
import {
  CreateClassDto,
  UpdateClassDto,
  EnrollStudentDto,
} from "../validators/class.dto";

const router = Router();

// POST /classes - Create new class (Admin only)
router.post(
  "/",
  ...authAndRequireRoles("admin"),
  validateBody(CreateClassDto),
  ClassController.createClass
);

// GET /classes - Get all classes (Admin, Teacher, and Student)
router.get(
  "/",
  ...authAndRequireRoles("admin", "teacher", "student"),
  ClassController.getClasses
);

// GET /classes/:id - Get class by ID (Admin and Teacher)
router.get(
  "/:id",
  ...authAndRequireRoles("admin", "teacher"),
  ClassController.getClassById
);

// GET /classes/:id/students - Get students of a class (Admin and Teacher)
router.get(
  "/:id/students",
  ...authAndRequireRoles("admin", "teacher"),
  ClassController.getClassStudents
);

// PUT /classes/:id - Update class (Admin only)
router.put(
  "/:id",
  ...authAndRequireRoles("admin"),
  validateBody(UpdateClassDto),
  ClassController.updateClass
);

// DELETE /classes/:id - Delete class (Admin only)
router.delete(
  "/:id",
  ...authAndRequireRoles("admin"),
  ClassController.deleteClass
);

// POST /classes/:id/enroll - Enroll student to class (Admin and Teacher)
router.post(
  "/:id/enroll",
  ...authAndRequireRoles("admin", "teacher"),
  validateBody(EnrollStudentDto),
  ClassController.enrollStudent
);

// PUT /classes/:id/assign-teacher - Assign teacher to class (Admin only)
router.put(
  "/:id/assign-teacher",
  ...authAndRequireRoles("admin"),
  ClassController.assignTeacherToClass
);

// DELETE /classes/:id/remove-teacher - Remove teacher from class (Admin only)
router.delete(
  "/:id/remove-teacher",
  ...authAndRequireRoles("admin"),
  ClassController.removeTeacherFromClass
);

export default router;

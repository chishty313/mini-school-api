import { Router } from "express";
import { TeacherController } from "../controllers/teacher.controller";
import { authAndRequireRoles } from "../middleware/auth";

const router = Router();

// GET /teacher/dashboard - Get teacher dashboard statistics
router.get(
  "/dashboard",
  ...authAndRequireRoles("teacher"),
  TeacherController.getDashboardStats
);

// GET /teacher/activities - Get teacher's recent activities
router.get(
  "/activities",
  ...authAndRequireRoles("teacher"),
  TeacherController.getRecentActivities
);

// GET /teacher/classes - Get teacher's classes
router.get(
  "/classes",
  ...authAndRequireRoles("teacher"),
  TeacherController.getTeacherClasses
);

export default router;

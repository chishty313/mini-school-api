import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { authAndRequireRoles } from "../middleware/auth";

const router = Router();

// Admin-only routes
router.get(
  "/stats",
  ...authAndRequireRoles("admin"),
  AdminController.getDashboardStats
);

router.get(
  "/teachers",
  ...authAndRequireRoles("admin"),
  AdminController.getTeachersWithDetails
);

router.get(
  "/teachers/available",
  ...authAndRequireRoles("admin"),
  AdminController.getAvailableTeachers
);

router.get(
  "/users",
  ...authAndRequireRoles("admin"),
  AdminController.getAllUsers
);

export default router;

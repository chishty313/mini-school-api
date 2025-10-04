import { Request, Response } from "express";
import { AdminService } from "../services/admin.service";

export class AdminController {
  /**
   * Get dashboard statistics for admin
   * GET /admin/stats
   */
  static async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await AdminService.getDashboardStats();

      res.status(200).json({
        message: "Dashboard statistics retrieved successfully",
        data: stats,
      });
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({
        error: "Failed to retrieve dashboard statistics",
        message: "An unexpected error occurred",
      });
    }
  }

  /**
   * Get all teachers with their classes and students
   * GET /admin/teachers
   */
  static async getTeachersWithDetails(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const teachers = await AdminService.getTeachersWithDetails();

      res.status(200).json({
        message: "Teachers retrieved successfully",
        data: { teachers },
      });
    } catch (error) {
      console.error("Get teachers error:", error);
      res.status(500).json({
        error: "Failed to retrieve teachers",
        message: "An unexpected error occurred",
      });
    }
  }

  /**
   * Get all users (admin, teachers, students)
   * GET /admin/users
   */
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await AdminService.getAllUsers();

      res.status(200).json({
        message: "Users retrieved successfully",
        data: { users },
      });
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({
        error: "Failed to retrieve users",
        message: "An unexpected error occurred",
      });
    }
  }

  /**
   * Get all available teachers (not assigned to classes)
   * GET /admin/teachers/available
   */
  static async getAvailableTeachers(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const teachers = await AdminService.getAvailableTeachers();

      res.status(200).json({
        message: "Available teachers retrieved successfully",
        data: { teachers },
      });
    } catch (error) {
      console.error("Get available teachers error:", error);
      res.status(500).json({
        error: "Failed to retrieve available teachers",
        message: "An unexpected error occurred",
      });
    }
  }
}

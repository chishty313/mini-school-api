import { Request, Response } from "express";
import { TeacherService } from "../services/teacher.service";

export class TeacherController {
  /**
   * Get teacher dashboard statistics
   * GET /teacher/dashboard
   * Access: Teacher only
   */
  static async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const teacherId = user.userId;

      const stats = await TeacherService.getDashboardStats(teacherId);

      res.status(200).json({
        message: "Dashboard statistics retrieved successfully",
        data: stats,
      });
    } catch (error) {
      console.error("Get teacher dashboard stats error:", error);
      res.status(500).json({
        error: "Failed to retrieve dashboard statistics",
        message: "An unexpected error occurred",
      });
    }
  }

  /**
   * Get teacher's recent activities
   * GET /teacher/activities
   * Access: Teacher only
   */
  static async getRecentActivities(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const teacherId = user.userId;

      const activities = await TeacherService.getRecentActivities(teacherId);

      res.status(200).json({
        message: "Recent activities retrieved successfully",
        data: { activities },
      });
    } catch (error) {
      console.error("Get teacher activities error:", error);
      res.status(500).json({
        error: "Failed to retrieve recent activities",
        message: "An unexpected error occurred",
      });
    }
  }

  /**
   * Get teacher's classes
   * GET /teacher/classes
   * Access: Teacher only
   */
  static async getTeacherClasses(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const teacherId = user.userId;

      const classes = await TeacherService.getTeacherClasses(teacherId);

      res.status(200).json({
        message: "Teacher classes retrieved successfully",
        data: { classes },
      });
    } catch (error) {
      console.error("Get teacher classes error:", error);
      res.status(500).json({
        error: "Failed to retrieve teacher classes",
        message: "An unexpected error occurred",
      });
    }
  }
}

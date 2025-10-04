// Load and validate environment variables FIRST
import { validateEnvironment, ENV } from "./config/env";
validateEnvironment();

// Import reflect-metadata for class-validator decorators
import "reflect-metadata";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { db } from "./config/database";
import { users, classes, students } from "./models/schema";

// Import routes
import authRoutes from "./routes/auth.routes";
import studentRoutes from "./routes/student.routes";
import classRoutes from "./routes/class.routes";
import teacherRoutes from "./routes/teacher.routes";
import adminRoutes from "./routes/admin.routes";

const app = express();

// Log environment status (only in development)
if (ENV.NODE_ENV === "development") {
  console.log("🔧 Environment Variables:");
  console.log(`- NODE_ENV: ${ENV.NODE_ENV}`);
  console.log(`- DB_NAME: ${ENV.DB_NAME}`);
  console.log(`- DB_HOST: ${ENV.DB_HOST}`);
  console.log(`- DB_PORT: ${ENV.DB_PORT}`);
  console.log(`- DB_USER: ${ENV.DB_USER}`);
  console.log(
    `- JWT_ACCESS_SECRET: ${ENV.JWT_ACCESS_SECRET ? "SET" : "NOT SET"}`
  );
  console.log(
    `- JWT_REFRESH_SECRET: ${ENV.JWT_REFRESH_SECRET ? "SET" : "NOT SET"}`
  );
}

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:3001", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
if (ENV.NODE_ENV === "development") {
  app.use(morgan("combined"));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic health check route
app.get("/", (req, res) => {
  res.json({
    message: "Mini School Management API",
    status: "Server is running!",
    timestamp: new Date().toISOString(),
    environment: ENV.NODE_ENV,
    endpoints: {
      auth: "/auth",
      students: "/students",
      classes: "/classes",
      teacher: "/teacher",
      admin: "/admin",
      health: "/",
      dbTest: "/test-db",
    },
  });
});

// Database connection test route
app.get("/test-db", async (req, res) => {
  try {
    // Simple query to test database connection
    const result = await db.select().from(users).limit(1);
    res.json({
      message: "Database connection successful!",
      status: "Connected to PostgreSQL",
      tablesReady: true,
    });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({
      message: "Database connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// API routes
app.use("/auth", authRoutes);
app.use("/students", studentRoutes);
app.use("/classes", classRoutes);
app.use("/teacher", teacherRoutes);
app.use("/admin", adminRoutes);

// 404 handler - Use middleware instead of wildcard
app.use((req, res, next) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      // Auth endpoints
      "POST /auth/register",
      "POST /auth/login",
      "POST /auth/refresh",
      "GET /auth/profile",
      "POST /auth/logout",
      // Student endpoints
      "POST /students",
      "GET /students",
      "GET /students/:id",
      "PUT /students/:id",
      "DELETE /students/:id",
      // Class endpoints
      "POST /classes",
      "GET /classes",
      "GET /classes/:id",
      "PUT /classes/:id",
      "DELETE /classes/:id",
      "GET /classes/:id/students",
      "POST /classes/:id/enroll",
      "PUT /classes/:id/assign-teacher",
      "DELETE /classes/:id/remove-teacher",
      // Teacher endpoints
      "GET /teacher/dashboard",
      "GET /teacher/activities",
      "GET /teacher/classes",
      // Admin endpoints
      "GET /admin/stats",
      "GET /admin/teachers",
      "GET /admin/teachers/available",
      "GET /admin/users",
      // Utility endpoints
      "GET /",
      "GET /test-db",
    ],
  });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err);
    res.status(500).json({
      message: "Internal Server Error",
      error:
        ENV.NODE_ENV === "development" ? err.message : "Something went wrong",
    });
  }
);

export default app;

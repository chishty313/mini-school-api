import { db } from "../config/database";
import { users, classes, students } from "../models/schema";
import { eq } from "drizzle-orm";

async function clearData() {
  try {
    console.log("🧹 Starting database cleanup...");

    // Clear all students
    console.log("🗑️  Clearing students...");
    await db.delete(students);
    console.log("✅ Students cleared");

    // Clear all classes
    console.log("🗑️  Clearing classes...");
    await db.delete(classes);
    console.log("✅ Classes cleared");

    // Clear all users except admin
    console.log("🗑️  Clearing non-admin users...");
    await db.delete(users).where(eq(users.role, "teacher"));
    await db.delete(users).where(eq(users.role, "student"));
    console.log("✅ Non-admin users cleared");

    console.log("🎉 Database cleanup completed successfully!");
    console.log("📝 Only admin user remains in the database");
    console.log("🔐 Admin credentials: admin@school.edu / AdminPass123!");
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    process.exit(1);
  }
}

clearData();

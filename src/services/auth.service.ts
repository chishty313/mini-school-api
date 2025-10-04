import { db } from "../config/database";
import { users, students, User, NewUser, NewStudent } from "../models/schema";
import { PasswordService } from "../utils/password";
import { JWTService, TokenPair } from "../utils/jwt";
import { eq } from "drizzle-orm";

export class AuthService {
  /**
   * Register a new user
   */
  static async registerUser(userData: {
    name: string;
    email: string;
    password: string;
    role: "admin" | "teacher" | "student";
  }): Promise<{ user: Omit<User, "passwordHash">; tokens: TokenPair }> {
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, userData.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error("User with this email already exists");
    }

    // Validate password strength
    const passwordValidation = PasswordService.validatePasswordStrength(
      userData.password
    );
    if (!passwordValidation.isValid) {
      throw new Error(
        `Password validation failed: ${passwordValidation.errors.join(", ")}`
      );
    }

    // Hash password
    const hashedPassword = await PasswordService.hashPassword(
      userData.password
    );

    // Create user
    const newUser: NewUser = {
      name: userData.name,
      email: userData.email,
      passwordHash: hashedPassword,
      role: userData.role,
    };

    const [createdUser] = await db.insert(users).values(newUser).returning();

    // If the user is a student, also create a student record
    if (userData.role === "student") {
      const newStudent: NewStudent = {
        name: userData.name,
        age: 18, // Default age, can be updated later
        classId: null, // No class assigned initially
      };

      await db.insert(students).values(newStudent);
    }

    // Generate tokens
    const tokens = JWTService.generateTokens({
      userId: createdUser.id,
      email: createdUser.email,
      role: createdUser.role,
    });

    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = createdUser;

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  /**
   * Login user
   */
  static async loginUser(
    email: string,
    password: string
  ): Promise<{ user: Omit<User, "passwordHash">; tokens: TokenPair }> {
    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await PasswordService.comparePassword(
      password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate tokens
    const tokens = JWTService.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  /**
   * Refresh access token
   */
  static async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    try {
      // Verify refresh token
      const payload = JWTService.verifyRefreshToken(refreshToken);

      // Verify user still exists
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, payload.userId))
        .limit(1);

      if (!user) {
        throw new Error("User no longer exists");
      }

      // Generate new tokens
      return JWTService.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(
    userId: number
  ): Promise<Omit<User, "passwordHash"> | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return null;
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { RegisterUserDto, LoginUserDto, RefreshTokenDto } from '../validators/auth.dto';

export class AuthController {
  /**
   * Register a new user
   * POST /auth/register
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, role } = req.body as RegisterUserDto;

      const result = await AuthService.registerUser({
        name,
        email,
        password,
        role,
      });

      res.status(201).json({
        message: 'User registered successfully',
        data: {
          user: result.user,
          tokens: result.tokens,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        // Handle known errors
        if (error.message.includes('already exists')) {
          res.status(409).json({
            error: 'Registration failed',
            message: error.message,
          });
        } else if (error.message.includes('Password validation failed')) {
          res.status(400).json({
            error: 'Registration failed',
            message: error.message,
          });
        } else {
          res.status(500).json({
            error: 'Registration failed',
            message: 'An unexpected error occurred',
          });
        }
      } else {
        res.status(500).json({
          error: 'Registration failed',
          message: 'An unexpected error occurred',
        });
      }
    }
  }

  /**
   * Login user
   * POST /auth/login
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as LoginUserDto;

      const result = await AuthService.loginUser(email, password);

      res.status(200).json({
        message: 'Login successful',
        data: {
          user: result.user,
          tokens: result.tokens,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({
          error: 'Login failed',
          message: error.message,
        });
      } else {
        res.status(500).json({
          error: 'Login failed',
          message: 'An unexpected error occurred',
        });
      }
    }
  }

  /**
   * Refresh access token
   * POST /auth/refresh
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body as RefreshTokenDto;

      const tokens = await AuthService.refreshAccessToken(refreshToken);

      res.status(200).json({
        message: 'Token refreshed successfully',
        data: { tokens },
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({
          error: 'Token refresh failed',
          message: error.message,
        });
      } else {
        res.status(500).json({
          error: 'Token refresh failed',
          message: 'An unexpected error occurred',
        });
      }
    }
  }

  /**
   * Get current user profile
   * GET /auth/profile
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      // User is available from auth middleware
      const userId = req.user!.userId;

      const user = await AuthService.getUserById(userId);

      if (!user) {
        res.status(404).json({
          error: 'User not found',
          message: 'User profile not found',
        });
        return;
      }

      res.status(200).json({
        message: 'Profile retrieved successfully',
        data: { user },
      });
    } catch (error) {
      res.status(500).json({
        error: 'Profile retrieval failed',
        message: 'An unexpected error occurred',
      });
    }
  }

  /**
   * Logout (client-side token removal)
   * POST /auth/logout
   */
  static async logout(req: Request, res: Response): Promise<void> {
    // In a JWT-based system, logout is typically handled client-side
    // by removing tokens from storage
    res.status(200).json({
      message: 'Logout successful',
      note: 'Please remove tokens from client storage',
    });
  }
}
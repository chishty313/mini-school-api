import { Request, Response, NextFunction } from 'express';
import { JWTService, JWTPayload } from '../utils/jwt';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware to verify JWT token
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTService.extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({
        error: 'Authentication failed',
        message: 'Access token is required',
      });
      return;
    }

    const payload = JWTService.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({
        error: 'Authentication failed',
        message: error.message,
      });
    } else {
      res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid token',
      });
    }
  }
};

/**
 * Middleware to check user roles
 */
export const requireRoles = (...roles: ('admin' | 'teacher' | 'student')[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'User not authenticated',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Access forbidden',
        message: `This action requires one of the following roles: ${roles.join(', ')}`,
        userRole: req.user.role,
      });
      return;
    }

    next();
  };
};

/**
 * Combined middleware: authenticate + authorize
 */
export const authAndRequireRoles = (...roles: ('admin' | 'teacher' | 'student')[]) => {
  return [authenticateToken, requireRoles(...roles)];
};
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { ENV } from '../config/env';

export interface JWTPayload {
  userId: number;
  email: string;
  role: 'admin' | 'teacher' | 'student';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class JWTService {
  private static readonly ACCESS_SECRET = ENV.JWT_ACCESS_SECRET;
  private static readonly REFRESH_SECRET = ENV.JWT_REFRESH_SECRET;
  private static readonly ACCESS_EXPIRES_IN = ENV.JWT_ACCESS_EXPIRES_IN;
  private static readonly REFRESH_EXPIRES_IN = ENV.JWT_REFRESH_EXPIRES_IN;

  /**
   * Generate access and refresh tokens
   */
  static generateTokens(payload: JWTPayload): TokenPair {
    const accessToken = jwt.sign(
      payload,
      this.ACCESS_SECRET,
      { expiresIn: this.ACCESS_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      payload,
      this.REFRESH_SECRET,
      { expiresIn: this.REFRESH_EXPIRES_IN }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.ACCESS_SECRET) as JwtPayload;
      return decoded as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.REFRESH_SECRET) as JwtPayload;
      return decoded as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Extract token from Bearer header
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7); // Remove "Bearer " prefix
  }
}
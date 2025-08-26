import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { RegisterUserDto, LoginUserDto, RefreshTokenDto } from '../validators/auth.dto';

const router = Router();

// Public routes (no authentication required)
router.post('/register', validateBody(RegisterUserDto), AuthController.register);
router.post('/login', validateBody(LoginUserDto), AuthController.login);
router.post('/refresh', validateBody(RefreshTokenDto), AuthController.refreshToken);

// Protected routes (authentication required)
router.get('/profile', authenticateToken, AuthController.getProfile);
router.post('/logout', authenticateToken, AuthController.logout);

export default router;
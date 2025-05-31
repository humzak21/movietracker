import express from 'express';
import { verifyGoogleToken, authenticateToken } from '../middleware/auth.js';
import { 
  googleLogin, 
  verifyToken, 
  logout, 
  checkBlacklist 
} from '../controllers/authController.js';

const router = express.Router();

// Google OAuth login
router.post('/google', verifyGoogleToken, googleLogin);

// Verify JWT token
router.get('/verify', checkBlacklist, authenticateToken, verifyToken);

// Logout
router.post('/logout', logout);

export default router; 
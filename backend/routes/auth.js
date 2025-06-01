import express from 'express';
import { verifyGoogleToken, authenticateToken } from '../middleware/auth.js';
import { 
  googleLogin, 
  googleCallback,
  verifyToken, 
  logout, 
  checkBlacklist 
} from '../controllers/authController.js';

const router = express.Router();

// Google OAuth login (ID Token flow)
router.post('/google', verifyGoogleToken, googleLogin);

// Google OAuth callback (Authorization Code flow)
router.post('/google/callback', googleCallback);

// Verify JWT token
router.get('/verify', checkBlacklist, authenticateToken, verifyToken);

// Logout
router.post('/logout', logout);

export default router; 
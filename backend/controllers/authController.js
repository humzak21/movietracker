import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { OAuth2Client } from 'google-auth-library';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

// Store for blacklisted tokens (in production, use Redis or database)
const blacklistedTokens = new Set();

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Helper function to create or update user
const createOrUpdateUser = async (googleUser) => {
  // Check if user exists in database
  let { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('email', googleUser.email)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Database error:', fetchError);
    throw new Error('Database error');
  }

  let user;

  if (existingUser) {
    // Update existing user info
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        name: googleUser.name,
        picture: googleUser.picture,
        last_login: new Date().toISOString(),
      })
      .eq('id', existingUser.id)
      .select()
      .single();

    if (updateError) {
      console.error('Update user error:', updateError);
      throw new Error('Failed to update user');
    }

    user = updatedUser;
  } else {
    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        google_id: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      console.error('Create user error:', createError);
      throw new Error('Failed to create user');
    }

    user = newUser;
  }

  return user;
};

// Google OAuth login (ID Token flow)
export const googleLogin = async (req, res) => {
  try {
    const { googleUser } = req; // Set by verifyGoogleToken middleware

    if (!googleUser.email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Google account email not verified'
      });
    }

    const user = await createOrUpdateUser(googleUser);

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      }
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Google OAuth callback (Authorization Code flow)
export const googleCallback = async (req, res) => {
  try {
    const { code, redirectUri } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code required'
      });
    }

    console.log('🔍 Backend: Exchanging authorization code for tokens');

    // Exchange authorization code for tokens
    const { tokens } = await googleClient.getToken({
      code,
      redirect_uri: redirectUri,
    });

    console.log('🔍 Backend: Token exchange successful');

    // Verify the ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log('🔍 Backend: ID token verified, user:', payload.email);

    if (!payload.email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Google account email not verified'
      });
    }

    const googleUser = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      email_verified: payload.email_verified,
    };

    const user = await createOrUpdateUser(googleUser);

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      }
    });

  } catch (error) {
    console.error('Google callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Token exchange failed'
    });
  }
};

// Verify token
export const verifyToken = async (req, res) => {
  try {
    const { user } = req; // Set by authenticateToken middleware

    // Get fresh user data from database
    const { data: currentUser, error } = await supabase
      .from('users')
      .select('id, email, name, picture')
      .eq('id', user.id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: currentUser
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Token verification failed'
    });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      // Add token to blacklist
      blacklistedTokens.add(token);
      
      // In production, you might want to store this in Redis with expiration
      // or maintain a database table of blacklisted tokens
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

// Check if token is blacklisted (middleware)
export const checkBlacklist = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token && blacklistedTokens.has(token)) {
    return res.status(401).json({
      success: false,
      message: 'Token has been revoked'
    });
  }

  next();
}; 
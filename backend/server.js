import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import movieRoutes from './routes/movieRoutes.js';

// Get current file directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
// Railway automatically provides environment variables, but we'll load .env for local development
if (process.env.NODE_ENV !== 'production') {
  // Try local backend .env first
  dotenv.config({
    path: path.resolve(__dirname, '.env')
  });
  
  // Fallback to root .env
  dotenv.config({
    path: path.resolve(__dirname, '../.env')
  });
}

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://image.tmdb.org"],
      fontSrc: ["'self'", "data:"],
      connectSrc: ["'self'"]
    }
  }
}));

// CORS configuration
const corsOrigins = [];

// Add localhost origins only in development
if (process.env.NODE_ENV !== 'production') {
  corsOrigins.push('http://localhost:3000', 'http://localhost:5173');
}

// Always add production frontend URL if provided
if (process.env.FRONTEND_URL) {
  corsOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: corsOrigins.length > 0 ? corsOrigins : false,
  credentials: true,
  optionsSuccessStatus: 200
}));

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api', movieRoutes);

// Serve static files from the frontend build in production
if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.resolve(__dirname, '../dist');
  app.use(express.static(frontendBuildPath));
  
  // Handle React Router - send all non-API requests to index.html
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(frontendBuildPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// 404 handler for API routes only
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Movie Tracker Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  if (process.env.NODE_ENV === 'production') {
    console.log(`🔗 Health check: /health`);
    console.log(`📡 API base URL: /api`);
    console.log(`🌐 CORS Origins: ${corsOrigins.join(', ')}`);
  } else {
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`📡 API base URL: http://localhost:${PORT}/api`);
    console.log(`🌐 CORS Origins: ${corsOrigins.join(', ')}`);
  }
});

export default app; 
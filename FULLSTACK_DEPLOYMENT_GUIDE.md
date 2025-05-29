# Movie Tracker - Full-Stack Deployment Guide

## 🎯 Architecture Overview

Your Movie Tracker application has been upgraded to a modern full-stack architecture:

- **Frontend**: React/Vite app (static files)
- **Backend**: Node.js/Express API server with Supabase integration
- **Database**: Supabase (PostgreSQL) with enhanced diary table
- **TMDB Integration**: Server-side via Node.js backend

## 🚨 What's Changed (Deprecated Code Removed)

### ❌ No Longer Used:
- **`api/` folder**: PHP TMDB proxy is deprecated
- **CSV file deployment**: Data should be in Supabase database
- **`router.php`**: Not needed for this architecture
- **Direct TMDB API calls from frontend**: Now handled by backend

### ✅ New Architecture:
- **Backend API**: `/backend` folder contains Node.js server
- **Environment Variables**: Proper separation of frontend/backend config
- **Database Integration**: All movie data stored in Supabase
- **Poster URLs**: Stored in database, not loaded dynamically

## 🛠️ Environment Variables Setup

### Frontend Environment Variables
Create `.env` in project root:
```env
# Frontend Environment Variables
VITE_API_BASE_URL=https://your-domain.com/backend/api
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend Environment Variables
The backend needs these variables (handled automatically in deployment):
```env
# Backend Environment Variables
NODE_ENV=production
PORT=3001

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# TMDB API Configuration
TMDB_API_KEY=your_tmdb_api_key
TMDB_BASE_URL=https://api.themoviedb.org/3

# CORS Configuration
FRONTEND_URL=https://your-domain.com
```

## 📦 Deployment Methods

### Method 1: Using GitHub Actions (Recommended)

#### Required GitHub Secrets:
Set these in your repository Settings → Secrets and variables → Actions:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
TMDB_API_KEY=your_tmdb_api_key
FRONTEND_URL=https://your-domain.com
CPANEL_FTP_SERVER=your-ftp-server.com
CPANEL_FTP_USERNAME=your-ftp-username
CPANEL_FTP_PASSWORD=your-ftp-password
```

#### Deployment Process:
1. Push to `main` branch
2. GitHub Actions automatically builds and deploys
3. Both frontend and backend are deployed together

### Method 2: Manual Deployment

#### Step 1: Run Deployment Script
```bash
# From project root
./setup-deployment.sh
```

#### Step 2: Configure Backend
```bash
# Edit the backend environment file
cd deployment/backend
cp .env.production .env
# Edit .env with your actual values
```

#### Step 3: Upload Files
Upload the entire `deployment/` folder contents to your server's `public_html/` directory.

## 🔧 Server Requirements

### For VPS/Cloud Server (Recommended):
- Node.js v18+
- npm
- Process manager (PM2 recommended)

### For Shared Hosting:
- PHP support (for Node.js wrapper)
- Node.js support (if available)
- File upload capabilities

## 🚀 Production Setup

### VPS/Cloud Server Setup:
```bash
# On your server
cd public_html/backend
npm install
npm start

# Or use PM2 for production
npm install -g pm2
pm2 start server.js --name "movie-tracker-api"
pm2 startup
pm2 save
```

### Nginx Reverse Proxy Configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    # Serve frontend static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy backend API requests
    location /backend/api {
        rewrite ^/backend/api/(.*)$ /api/$1 break;
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🧪 Testing Your Deployment

### 1. Frontend Test:
- Visit your domain
- Should see the React app loading
- Check browser console for errors

### 2. Backend API Test:
- Open browser console
- Test API connection:
```javascript
fetch('/backend/api/health')
  .then(r => r.json())
  .then(console.log)
```

### 3. Full Integration Test:
- Try adding a new movie
- Check if it appears in your Supabase database
- Verify TMDB data is being fetched

## 🔍 Troubleshooting

### Common Issues:

#### Frontend API Calls Failing:
1. Check `VITE_API_BASE_URL` environment variable
2. Verify backend is running
3. Check CORS settings in backend

#### Backend Not Starting:
1. Verify all environment variables are set
2. Check Node.js version (v18+ required)
3. Ensure Supabase credentials are correct

#### Database Connection Issues:
1. Verify Supabase URL and keys
2. Check if diary table exists with TMDB columns
3. Run migration if needed: `cd backend && npm run migrate`

#### TMDB Integration Not Working:
1. Verify TMDB_API_KEY is valid
2. Check rate limiting in backend logs
3. Test TMDB endpoints directly

## 📊 Migration from Old Architecture

If you're upgrading from the PHP-based system:

### 1. Database Migration:
```bash
cd backend
npm run migrate  # Adds TMDB columns to diary table
npm run enhance  # Populates TMDB data for existing movies
```

### 2. Remove Deprecated Files:
- Delete `api/` folder from your server
- Remove any PHP TMDB configuration files
- Clean up old CSV files (data should be in Supabase)

### 3. Update Frontend Configuration:
- Set proper `VITE_API_BASE_URL`
- Update any hardcoded API endpoints

## 🎉 Benefits of New Architecture

1. **Better Performance**: Server-side TMDB integration
2. **Improved Security**: API keys stored server-side
3. **Scalability**: Proper separation of concerns
4. **Maintainability**: Modern Node.js backend
5. **Database Efficiency**: All data in Supabase
6. **CORS Compliance**: Proper API architecture

## 📞 Support

If you encounter issues:
1. Check server logs for errors
2. Verify all environment variables
3. Test each component individually
4. Review deployment instructions carefully

The new architecture provides a much more robust foundation for your Movie Tracker application! 
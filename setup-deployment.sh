#!/bin/bash

echo "🎬 Movie Tracker - Full Stack Deployment Setup"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    echo "   Make sure you have both frontend (package.json) and backend/ folder"
    exit 1
fi

# Step 1: Install dependencies and build frontend
echo "📦 Building React frontend..."
npm install
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed. Please fix any errors and try again."
    exit 1
fi

echo "✅ Frontend build completed"

# Step 2: Prepare backend for deployment
echo "🚀 Preparing backend for deployment..."
cd backend

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install --production

if [ $? -ne 0 ]; then
    echo "❌ Backend dependency installation failed"
    exit 1
fi

# Go back to root
cd ..

# Step 3: Create deployment directory
echo "📁 Creating deployment directory..."
rm -rf deployment
mkdir -p deployment

# Step 4: Copy frontend build files
echo "📋 Copying frontend build files..."
cp -r dist/* deployment/

# Step 5: Copy backend files
echo "🚀 Copying backend files..."
mkdir -p deployment/backend
cp -r backend/* deployment/backend/

# Remove backend dev dependencies and unnecessary files
echo "🧹 Cleaning up backend files..."
rm -rf deployment/backend/node_modules
rm -f deployment/backend/.env
rm -f deployment/backend/nodemon.json
rm -rf deployment/backend/.git*

# Step 6: Copy configuration files (but skip deprecated ones)
echo "📋 Copying configuration files..."
cp .htaccess deployment/ 2>/dev/null || echo "⚠️  .htaccess not found - will be created"

# Skip copying the deprecated API folder
echo "⚠️  Skipping deprecated api/ folder (PHP files no longer needed)"

# Skip CSV files - they should be imported to Supabase database instead
echo "⚠️  Skipping CSV files - data should be in Supabase database"

# Step 7: Create production environment file template for backend
echo "🔧 Creating backend environment template..."
cat > deployment/backend/.env.production << EOF
# Production Backend Configuration
NODE_ENV=production
PORT=3001

# Supabase Configuration (REQUIRED)
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_supabase_service_role_key

# TMDB API Configuration (REQUIRED)
TMDB_API_KEY=your_tmdb_api_key
TMDB_BASE_URL=https://api.themoviedb.org/3

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration (REQUIRED - Update with your domain)
FRONTEND_URL=https://your-domain.com
EOF

# Step 8: Create .htaccess if it doesn't exist
if [ ! -f "deployment/.htaccess" ]; then
    echo "📝 Creating .htaccess for frontend routing..."
    cat > deployment/.htaccess << 'EOF'
# Movie Tracker Frontend Configuration
RewriteEngine On

# Handle React Router (redirect all requests to index.html)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/backend
RewriteRule . /index.html [L]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"

# Cache static assets
<filesMatch "\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 month"
</filesMatch>
EOF
fi

# Step 9: Create backend .htaccess for API routing
echo "📝 Creating backend .htaccess..."
mkdir -p deployment/backend/public
cat > deployment/backend/.htaccess << 'EOF'
# Backend API Configuration
RewriteEngine On

# Redirect all requests to server.js via index.php wrapper
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [L]
EOF

# Step 10: Create PHP wrapper for Node.js backend (for shared hosting)
echo "🐘 Creating PHP wrapper for Node.js backend..."
cat > deployment/backend/index.php << 'EOF'
<?php
// PHP wrapper to run Node.js backend on shared hosting
// This assumes your hosting provider supports Node.js execution

// Set environment variables
putenv('NODE_ENV=production');

// Change to backend directory
chdir(__DIR__);

// Execute Node.js server
$command = 'node server.js 2>&1';
$output = shell_exec($command);

// Return output
header('Content-Type: application/json');
echo $output;
?>
EOF

# Step 11: Create deployment instructions
cat > deployment/DEPLOYMENT_INSTRUCTIONS.txt << EOF
Movie Tracker - Full Stack Deployment Instructions
==================================================

ARCHITECTURE:
- Frontend: React/Vite app (static files)
- Backend: Node.js/Express API server
- Database: Supabase (PostgreSQL)

BEFORE UPLOADING:
1. Configure backend environment:
   - Edit backend/.env.production with your actual values:
     * SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
     * TMDB_API_KEY
     * FRONTEND_URL (your actual domain)

2. Set up your database:
   - Your Supabase database should already have the 'diary' table with TMDB columns
   - If not, run the migration script: cd backend && npm run migrate

DEPLOYMENT OPTIONS:

OPTION A: VPS/Cloud Server (Recommended)
1. Upload entire deployment/ folder to your server
2. Install Node.js (v18+) on your server
3. In the backend/ directory: npm install
4. Copy .env.production to .env
5. Start the backend: npm start (or use PM2 for production)
6. Configure reverse proxy (Nginx/Apache) to serve frontend and proxy /api to backend

OPTION B: Shared Hosting (Limited Support)
1. Upload all files to public_html/
2. Backend might work if your host supports Node.js execution
3. You may need to run backend separately and update VITE_API_BASE_URL

FILE STRUCTURE AFTER UPLOAD:
public_html/
├── index.html (React app entry point)
├── assets/ (CSS, JS, images)
├── backend/ (Node.js API server)
└── .htaccess (frontend routing)

ENVIRONMENT VARIABLES NEEDED:
Frontend (.env):
- VITE_API_BASE_URL=https://your-domain.com/backend/api
- VITE_SUPABASE_URL=your_supabase_url
- VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

Backend (.env):
- All variables in backend/.env.production

DEPRECATED FILES (NO LONGER NEEDED):
- api/ folder (PHP TMDB proxy) - replaced by Node.js backend
- CSV files - data should be in Supabase database
- router.php - not needed for this architecture

TESTING DEPLOYMENT:
1. Visit your domain - should show the React app
2. Check browser console for API errors
3. Test adding a movie to verify backend connection
4. Check Supabase dashboard for new entries

TROUBLESHOOTING:
- If API calls fail, check CORS settings in backend
- Ensure backend .env has correct FRONTEND_URL
- Verify Supabase credentials and database access
- Check server logs for Node.js backend errors
EOF

echo ""
echo "🎉 Full-stack deployment files ready!"
echo ""
echo "📂 Files prepared in: ./deployment/"
echo ""
echo "⚠️  CRITICAL NEXT STEPS:"
echo "1. Edit deployment/backend/.env.production with your actual values"
echo "2. Choose your deployment method (see DEPLOYMENT_INSTRUCTIONS.txt)"
echo "3. Ensure your Supabase database is set up with the enhanced diary table"
echo "4. Upload files and configure your server"
echo ""
echo "📖 See deployment/DEPLOYMENT_INSTRUCTIONS.txt for detailed instructions"
echo "🚨 The old PHP api/ folder is deprecated and not included"
echo ""
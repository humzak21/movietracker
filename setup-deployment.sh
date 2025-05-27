#!/bin/bash

echo "🎬 Movie Tracker - Deployment Setup"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Step 1: Build the React application
echo "📦 Building React application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix any errors and try again."
    exit 1
fi

echo "✅ Build completed successfully"

# Step 2: Create deployment directory
echo "📁 Creating deployment directory..."
rm -rf deployment
mkdir -p deployment

# Step 3: Copy built files
echo "📋 Copying built files..."
cp -r dist/* deployment/
cp -r api deployment/
cp .htaccess deployment/
cp router.php deployment/ 2>/dev/null || echo "⚠️  router.php not found - creating one for local development"
cp *.csv deployment/ 2>/dev/null || echo "⚠️  No CSV files found - make sure to upload them manually"

# Copy images_frontpage to assets folder
echo "🖼️  Copying slideshow images..."
if [ -d "src/assets/images_frontpage" ]; then
    mkdir -p deployment/assets
    cp -r src/assets/images_frontpage deployment/assets/
    echo "✅ Slideshow images copied to deployment/assets/images_frontpage/"
else
    echo "⚠️  src/assets/images_frontpage directory not found - slideshow images will not be available"
fi

# Step 4: Check if config.php exists
if [ ! -f "api/config.php" ]; then
    echo "⚠️  Creating config.php from example..."
    cp api/config.example.php deployment/api/config.php
    echo "🔑 IMPORTANT: Edit deployment/api/config.php and add your TMDB API key!"
fi

# Step 5: Create deployment instructions
cat > deployment/UPLOAD_INSTRUCTIONS.txt << EOF
Movie Tracker - Upload Instructions
==================================

1. BEFORE UPLOADING:
   - Edit api/config.php and replace 'YOUR_NEW_TMDB_API_KEY_HERE' with your actual TMDB API key
   - Get a new API key from: https://www.themoviedb.org/settings/api

2. UPLOAD ALL FILES in this directory to your cPanel public_html folder:
   - All HTML, CSS, JS files (from React build)
   - api/ folder (contains the backend proxy)
   - assets/ folder (contains slideshow images)
   - .htaccess file (URL rewriting and security)
   - router.php file (for local PHP development server - not needed for production)
   - CSV files (your movie data)

3. SET FILE PERMISSIONS:
   - PHP files: 644 or 755
   - Directories: 755
   - .htaccess: 644

4. TEST THE DEPLOYMENT:
   - Visit your website
   - Check that slideshow images load properly
   - Open browser console and run: window.debugTMDB()
   - Check for any errors

For detailed instructions, see DEPLOYMENT_GUIDE.md
EOF

echo ""
echo "🎉 Deployment files ready!"
echo ""
echo "📂 Files prepared in: ./deployment/"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. Edit deployment/api/config.php with your NEW TMDB API key"
echo "2. Upload all files from deployment/ folder to your cPanel public_html"
echo "3. Set proper file permissions"
echo "4. Test the deployment"
echo ""
echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"
echo ""
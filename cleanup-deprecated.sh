#!/bin/bash

echo "🧹 Movie Tracker - Deprecated Code Cleanup"
echo "=========================================="

echo ""
echo "📊 ANALYSIS: Deprecated vs Active Code"
echo ""

# Check for deprecated files
echo "❌ DEPRECATED FILES (can be removed):"
deprecated_files=()

if [ -d "api" ]; then
    echo "  📁 api/ folder (PHP TMDB proxy - replaced by Node.js backend)"
    deprecated_files+=("api/")
fi

if [ -f "router.php" ]; then
    echo "  📄 router.php (not needed for production deployment)"
    deprecated_files+=("router.php")
fi

# List CSV files
csv_files=$(find . -maxdepth 1 -name "*.csv" -type f)
if [ ! -z "$csv_files" ]; then
    echo "  📄 CSV files (data should be in Supabase database):"
    echo "$csv_files" | sed 's/^/    /'
    for file in $csv_files; do
        deprecated_files+=("$file")
    done
fi

if [ -f "test-tmdb.js" ]; then
    echo "  📄 test-tmdb.js (old testing script)"
    deprecated_files+=("test-tmdb.js")
fi

if [ -f "debug-tmdb.js" ]; then
    echo "  📄 debug-tmdb.js (old debugging script)"
    deprecated_files+=("debug-tmdb.js")
fi

echo ""
echo "✅ ACTIVE CODE (keep these):"
echo "  📁 backend/ folder (Node.js API server)"
echo "  📁 src/ folder (React frontend)"
echo "  📄 package.json (frontend dependencies)"
echo "  📄 vite.config.js (build configuration)"
echo "  📄 setup-deployment.sh (updated deployment script)"
echo "  📄 .github/workflows/deploy-cpanel.yml (updated CI/CD)"
echo "  📄 .htaccess (frontend routing)"

echo ""
echo "🔍 FRONTEND CODE STATUS:"

# Check if frontend is using the new API service
if grep -q "localhost:3001" src/services/apiService.js 2>/dev/null; then
    echo "  ✅ Frontend configured for Node.js backend"
else
    echo "  ⚠️  Frontend might need API configuration update"
fi

# Check for environment variable usage
if grep -q "import.meta.env.VITE_API_BASE_URL" src/services/apiService.js 2>/dev/null; then
    echo "  ✅ Frontend supports environment variables"
else
    echo "  ⚠️  Frontend might need environment variable support"
fi

echo ""
echo "🔍 BACKEND CODE STATUS:"

if [ -d "backend" ]; then
    echo "  ✅ Backend folder exists"
    
    if [ -f "backend/package.json" ]; then
        echo "  ✅ Backend has package.json"
    else
        echo "  ❌ Backend missing package.json"
    fi
    
    if [ -f "backend/server.js" ]; then
        echo "  ✅ Backend has main server file"
    else
        echo "  ❌ Backend missing server.js"
    fi
    
    if [ -d "backend/services" ] && [ -f "backend/services/tmdbService.js" ]; then
        echo "  ✅ Backend has TMDB service"
    else
        echo "  ❌ Backend missing TMDB service"
    fi
else
    echo "  ❌ Backend folder not found!"
    echo "     This suggests the project hasn't been fully migrated to the new architecture"
fi

echo ""
echo "📋 MIGRATION STATUS:"

# Check if diary table has TMDB columns
echo "  🗄️  Database: Check your Supabase diary table for TMDB columns"
echo "     Required columns: tmdb_id, overview, poster_url, backdrop_path, etc."
echo "     Run 'cd backend && npm run migrate' if needed"

# Check for environment files
if [ -f ".env" ]; then
    echo "  ✅ Environment file exists"
else
    echo "  ⚠️  No .env file found - create one for local development"
fi

if [ -f "backend/.env" ]; then
    echo "  ✅ Backend environment file exists"
else
    echo "  ⚠️  No backend/.env file found - create one for local development"
fi

echo ""

# Show deprecated file count
if [ ${#deprecated_files[@]} -eq 0 ]; then
    echo "🎉 No deprecated files found! Your project is clean."
else
    echo "🚨 Found ${#deprecated_files[@]} deprecated files/folders."
    echo ""
    echo "❓ What would you like to do?"
    echo "1. List deprecated files only"
    echo "2. Remove deprecated files (CAUTION: This will delete files!)"
    echo "3. Create backup and remove deprecated files"
    echo "4. Exit without changes"
    echo ""
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            echo ""
            echo "📋 Deprecated files that can be removed:"
            for file in "${deprecated_files[@]}"; do
                echo "  - $file"
            done
            echo ""
            echo "💡 These files are no longer used in the new Node.js backend architecture."
            ;;
        2)
            echo ""
            echo "⚠️  REMOVING DEPRECATED FILES..."
            for file in "${deprecated_files[@]}"; do
                if [ -e "$file" ]; then
                    echo "  Removing: $file"
                    rm -rf "$file"
                fi
            done
            echo "✅ Deprecated files removed!"
            ;;
        3)
            echo ""
            echo "📦 Creating backup..."
            backup_dir="deprecated_backup_$(date +%Y%m%d_%H%M%S)"
            mkdir -p "$backup_dir"
            
            for file in "${deprecated_files[@]}"; do
                if [ -e "$file" ]; then
                    echo "  Backing up: $file"
                    cp -r "$file" "$backup_dir/"
                fi
            done
            
            echo "🗑️  Removing deprecated files..."
            for file in "${deprecated_files[@]}"; do
                if [ -e "$file" ]; then
                    echo "  Removing: $file"
                    rm -rf "$file"
                fi
            done
            
            echo "✅ Backup created in: $backup_dir"
            echo "✅ Deprecated files removed!"
            ;;
        4)
            echo "No changes made."
            ;;
        *)
            echo "Invalid choice. No changes made."
            ;;
    esac
fi

echo ""
echo "📖 Next Steps:"
echo "1. Ensure your Supabase database is set up (run backend migration if needed)"
echo "2. Set up environment variables for both frontend and backend"
echo "3. Test the deployment with: ./setup-deployment.sh"
echo "4. Deploy using GitHub Actions or manual upload"
echo ""
echo "📚 See FULLSTACK_DEPLOYMENT_GUIDE.md for detailed instructions" 
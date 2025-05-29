#!/bin/bash

echo "🔒 Movie Tracker - Security Check"
echo "================================="

echo ""
echo "🔍 Scanning for security issues before GitHub commit..."

# Initialize security issue counter
security_issues=0
warnings=0

echo ""
echo "📋 CHECKING FOR SENSITIVE FILES:"

# Check for environment files
env_files=$(find . -name ".env*" -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null)
if [ ! -z "$env_files" ]; then
    echo "⚠️  Environment files found:"
    echo "$env_files" | sed 's/^/    /'
    echo "   These files should be in .gitignore and not committed!"
    security_issues=$((security_issues + 1))
fi

# Check for config files with potential secrets
config_files=$(find . -name "config.php" -o -name "*.key" -o -name "*.pem" -o -name "secrets.json" -o -name "credentials.json" 2>/dev/null | grep -v node_modules | grep -v .git)
if [ ! -z "$config_files" ]; then
    echo "⚠️  Configuration files found:"
    echo "$config_files" | sed 's/^/    /'
    echo "   Check these files for sensitive data!"
    security_issues=$((security_issues + 1))
fi

echo ""
echo "🔑 CHECKING FOR HARDCODED SECRETS:"

# Check for potential API keys or secrets in code
echo "Scanning for potential hardcoded secrets..."

# Check for suspicious patterns
suspicious_patterns=(
    "api_key.*=.*[a-zA-Z0-9]{20,}"
    "API_KEY.*=.*[a-zA-Z0-9]{20,}"
    "password.*=.*[^\s]{8,}"
    "secret.*=.*[a-zA-Z0-9]{20,}"
    "token.*=.*[a-zA-Z0-9]{20,}"
)

for pattern in "${suspicious_patterns[@]}"; do
    matches=$(grep -r -E "$pattern" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" --include="*.php" --include="*.json" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=deployment . 2>/dev/null || true)
    if [ ! -z "$matches" ]; then
        echo "⚠️  Potential secret found:"
        echo "$matches" | head -3 | sed 's/^/    /'
        if [ $(echo "$matches" | wc -l) -gt 3 ]; then
            echo "    ... and $(($(echo "$matches" | wc -l) - 3)) more matches"
        fi
        warnings=$((warnings + 1))
    fi
done

echo ""
echo "📂 CHECKING .GITIGNORE COVERAGE:"

# Check if important files are properly ignored
gitignore_checks=(
    ".env:Environment files"
    "backend/.env:Backend environment files"
    "api/config.php:API configuration"
    "node_modules/:Dependencies"
    "dist/:Build output"
    "deployment/:Deployment files"
)

missing_ignores=()
for check in "${gitignore_checks[@]}"; do
    file=$(echo "$check" | cut -d: -f1)
    desc=$(echo "$check" | cut -d: -f2)
    
    if ! grep -q "^$file" .gitignore 2>/dev/null; then
        missing_ignores+=("$file ($desc)")
    fi
done

if [ ${#missing_ignores[@]} -gt 0 ]; then
    echo "⚠️  Missing .gitignore entries:"
    for item in "${missing_ignores[@]}"; do
        echo "    - $item"
    done
    warnings=$((warnings + 1))
else
    echo "✅ .gitignore properly configured"
fi

echo ""
echo "🌐 CHECKING EXAMPLE FILES:"

# Check if example files contain real secrets
example_files=$(find . -name "*.example*" -o -name "env.example" 2>/dev/null)
for file in $example_files; do
    if [ -f "$file" ]; then
        # Look for patterns that might be real API keys (long alphanumeric strings)
        real_secrets=$(grep -E "[a-zA-Z0-9]{32,}" "$file" 2>/dev/null | grep -v "your_.*_here" | grep -v "example" | grep -v "placeholder" || true)
        if [ ! -z "$real_secrets" ]; then
            echo "⚠️  Potential real secrets in example file $file:"
            echo "$real_secrets" | sed 's/^/    /'
            security_issues=$((security_issues + 1))
        fi
    fi
done

echo ""
echo "📊 SECURITY SCAN RESULTS:"

if [ $security_issues -eq 0 ] && [ $warnings -eq 0 ]; then
    echo "🎉 No security issues found! Safe to commit to GitHub."
elif [ $security_issues -eq 0 ]; then
    echo "✅ No critical security issues found."
    echo "⚠️  Found $warnings warnings - please review before committing."
else
    echo "🚨 Found $security_issues critical security issues!"
    echo "⚠️  Found $warnings additional warnings."
    echo ""
    echo "❌ DO NOT COMMIT TO GITHUB until these issues are resolved!"
fi

echo ""
echo "🛡️ SECURITY BEST PRACTICES:"
echo "1. Never commit .env files or real API keys"
echo "2. Use environment variables for all secrets"
echo "3. Use placeholder values in example files"
echo "4. Keep .gitignore up to date"
echo "5. Review all files before committing"

echo ""
echo "🔧 TO FIX ISSUES:"
echo "1. Move real secrets to .env files (already gitignored)"
echo "2. Replace hardcoded secrets with environment variables"
echo "3. Use placeholders in example files"
echo "4. Run: git status --ignored to see what's being ignored"

if [ $security_issues -gt 0 ]; then
    exit 1
else
    exit 0
fi 
# Movie Tracker - cPanel Deployment Guide

This guide will help you deploy your Movie Tracker application to cPanel hosting with a secure backend proxy for TMDB API calls.

## 🚨 Security Update

Your TMDB API key was previously exposed in the frontend bundle. This deployment implements a secure backend proxy to protect your API key.

## Prerequisites

1. **New TMDB API Key**: Generate a new API key from [TMDB](https://www.themoviedb.org/settings/api) to replace the exposed one
2. **cPanel Hosting**: With PHP support (most cPanel hosts support PHP 7.4+)
3. **Domain/Subdomain**: Where you'll host the application

## File Structure

After deployment, your cPanel public_html directory should look like this:

```
public_html/
├── index.html                 # React app entry point
├── assets/                    # Built React app assets
│   ├── index-[hash].js
│   └── index-[hash].css
├── api/                       # Backend proxy
│   ├── tmdb.php              # Main proxy script
│   └── config.php            # API key configuration
├── .htaccess                 # URL rewriting and security
├── movies_complete.csv       # Your movie data
└── other CSV files...
```

## Step-by-Step Deployment

### 1. Build the React Application

```bash
# In your local project directory
npm run build
```

This creates a `dist/` folder with your built application.

### 2. Prepare the Backend Files

The following files have been created for you:

- `api/tmdb.php` - The main proxy script
- `api/config.php` - Configuration file for your API key
- `.htaccess` - URL rewriting and security rules

### 3. Configure the API Key

1. **Get a new TMDB API key** from https://www.themoviedb.org/settings/api
2. **Edit `api/config.php`** and replace `YOUR_NEW_TMDB_API_KEY_HERE` with your actual API key:

```php
<?php
return [
    'tmdb_api_key' => 'your_actual_api_key_here'
];
?>
```

### 4. Upload Files to cPanel

#### Option A: File Manager (Recommended for beginners)

1. **Login to cPanel** and open File Manager
2. **Navigate to public_html** (or your domain's document root)
3. **Upload the built files**:
   - Upload all contents from `dist/` folder to the root
   - Upload the `api/` folder
   - Upload `.htaccess`
   - Upload your CSV files

#### Option B: FTP/SFTP

1. **Connect via FTP** using your cPanel credentials
2. **Navigate to public_html**
3. **Upload all files** maintaining the directory structure

### 5. Set File Permissions

Ensure proper permissions are set:

- **PHP files**: 644 or 755
- **Directories**: 755
- **.htaccess**: 644

In cPanel File Manager, right-click files → Change Permissions.

### 6. Test the Deployment

1. **Visit your domain** - the React app should load
2. **Open browser console** and run:
   ```javascript
   window.debugTMDB()
   ```
3. **Check for errors** - you should see successful API connectivity

## Security Features Implemented

### 1. API Key Protection
- ✅ API key stored server-side only
- ✅ Never exposed to client-side code
- ✅ Protected by .htaccess rules

### 2. CORS Headers
- ✅ Proper CORS configuration
- ✅ Secure cross-origin requests

### 3. Security Headers
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: DENY
- ✅ X-XSS-Protection: enabled
- ✅ Referrer-Policy: strict-origin-when-cross-origin

### 4. File Protection
- ✅ Config files protected from direct access
- ✅ Sensitive files blocked via .htaccess

## Troubleshooting

### Common Issues

#### 1. "API key not configured" Error
- **Cause**: config.php not properly configured
- **Solution**: Ensure you've replaced the placeholder with your actual API key

#### 2. 500 Internal Server Error
- **Cause**: PHP syntax error or missing files
- **Solution**: Check cPanel Error Logs and verify all files uploaded correctly

#### 3. API calls failing
- **Cause**: .htaccess rewrite rules not working
- **Solution**: Ensure mod_rewrite is enabled on your hosting

#### 4. CORS errors
- **Cause**: Incorrect domain configuration
- **Solution**: Update CORS headers in tmdb.php if needed

### Checking Logs

1. **cPanel Error Logs**: Check for PHP errors
2. **Browser Console**: Check for JavaScript errors
3. **Network Tab**: Verify API calls are reaching `/api/tmdb/`

## Performance Optimizations

The deployment includes:

- ✅ **Gzip compression** for faster loading
- ✅ **Static asset caching** (1 year expiry)
- ✅ **Optimized image delivery** from TMDB CDN

## Maintenance

### Updating the Application

1. **Build locally**: `npm run build`
2. **Upload new assets**: Replace files in public_html
3. **Clear browser cache**: Force refresh (Ctrl+F5)

### Monitoring

- **Check API usage**: Monitor your TMDB API quota
- **Review logs**: Regularly check for errors
- **Update dependencies**: Keep React app updated

## Environment Variables

The application no longer uses environment variables for the API key. All configuration is handled server-side through `api/config.php`.

## Backup Strategy

**Important files to backup**:
- `api/config.php` (contains your API key)
- All CSV files (your movie data)
- Custom modifications to the React app

## Support

If you encounter issues:

1. **Check the browser console** for JavaScript errors
2. **Review cPanel error logs** for PHP errors
3. **Verify file permissions** are correct
4. **Test API connectivity** using the debug function

## Security Checklist

Before going live:

- [ ] New TMDB API key generated and configured
- [ ] Old API key revoked/deleted
- [ ] config.php contains actual API key (not placeholder)
- [ ] .htaccess file uploaded and working
- [ ] API endpoints responding correctly
- [ ] No sensitive data in browser developer tools
- [ ] All CSV files uploaded
- [ ] Application loads and functions correctly

---

**🎉 Your Movie Tracker is now securely deployed with a protected API key!** 
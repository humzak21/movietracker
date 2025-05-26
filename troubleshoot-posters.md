# Poster Loading Troubleshooting Guide

## 🖼️ Common Poster Loading Issues

### **Issue 1: API Proxy Not Working**
**Symptoms:** No posters load, console shows 404 errors for `/api/tmdb/` calls

**Check:**
1. Open browser Network tab (F12 → Network)
2. Look for failed requests to `/api/tmdb/`
3. Check if requests return 404 or 500 errors

**Solutions:**
- Verify `.htaccess` file is uploaded
- Check if mod_rewrite is enabled on your hosting
- Ensure `api/tmdb.php` file is uploaded correctly

### **Issue 2: CORS Errors**
**Symptoms:** Console shows CORS policy errors

**Check:**
```javascript
// In browser console
fetch('/api/tmdb/configuration')
  .then(r => r.json())
  .then(d => console.log('✅ API working:', d))
  .catch(e => console.error('❌ API error:', e))
```

**Solutions:**
- Verify CORS headers in `api/tmdb.php`
- Check if your domain matches the hosting setup

### **Issue 3: API Key Issues**
**Symptoms:** API calls return 401 Unauthorized

**Check:**
1. Verify `api/config.php` has correct API key
2. Test API key directly: https://api.themoviedb.org/3/configuration?api_key=YOUR_KEY

**Solutions:**
- Double-check API key in config.php
- Ensure no extra spaces or characters
- Verify API key is active on TMDB

### **Issue 4: File Permissions**
**Symptoms:** 500 Internal Server Error

**Check cPanel Error Logs:**
- Look for PHP errors
- Check file permission issues

**Solutions:**
- Set PHP files to 644 or 755
- Set directories to 755
- Ensure config.php is readable by web server

### **Issue 5: Poster URLs Not Generated**
**Symptoms:** API works but poster URLs are null/empty

**Debug in Console:**
```javascript
// Test a specific movie
fetch('/api/tmdb/search/movie?query=batman')
  .then(r => r.json())
  .then(d => {
    console.log('Search results:', d);
    if (d.results && d.results[0]) {
      console.log('First movie poster_path:', d.results[0].poster_path);
    }
  })
```

### **Issue 6: Image Loading Blocked**
**Symptoms:** API returns poster paths but images don't display

**Check:**
1. Right-click on broken image → "Inspect Element"
2. Look for 403 Forbidden or other HTTP errors
3. Check if TMDB image URLs are accessible

**Test Direct Image Access:**
```javascript
// Test if TMDB images load
const testImg = new Image();
testImg.onload = () => console.log('✅ TMDB images accessible');
testImg.onerror = () => console.log('❌ TMDB images blocked');
testImg.src = 'https://image.tmdb.org/t/p/w500/cij4dd21v2Rk2YtUQbV5kW69WB2.jpg';
```

## 🔧 **Quick Diagnostic Commands**

### **1. Test API Endpoint:**
```javascript
fetch('/api/tmdb/configuration')
  .then(response => {
    console.log('Status:', response.status);
    return response.json();
  })
  .then(data => console.log('Config:', data))
  .catch(error => console.error('Error:', error));
```

### **2. Test Movie Search:**
```javascript
fetch('/api/tmdb/search/movie?query=batman')
  .then(r => r.json())
  .then(d => console.log('Movies found:', d.results?.length || 0))
  .catch(e => console.error('Search error:', e));
```

### **3. Test Poster URL Generation:**
```javascript
// Check if your app is generating poster URLs correctly
const testMovie = { poster_path: '/cij4dd21v2Rk2YtUQbV5kW69WB2.jpg' };
const posterUrl = `https://image.tmdb.org/t/p/w500${testMovie.poster_path}`;
console.log('Generated poster URL:', posterUrl);

// Test if it loads
const img = new Image();
img.onload = () => console.log('✅ Poster loads successfully');
img.onerror = () => console.log('❌ Poster failed to load');
img.src = posterUrl;
```

## 📋 **Deployment Checklist**

Before troubleshooting, ensure:

- [ ] All files from `deployment/` folder uploaded to public_html
- [ ] `api/config.php` contains your actual API key
- [ ] `.htaccess` file uploaded and working
- [ ] File permissions set correctly (PHP: 644/755, Directories: 755)
- [ ] No PHP syntax errors (check cPanel error logs)
- [ ] mod_rewrite enabled on hosting (most cPanel hosts have this)

## 🆘 **Getting Help**

If issues persist:

1. **Check cPanel Error Logs** for PHP errors
2. **Use browser Network tab** to see failed requests
3. **Test API key directly** on TMDB website
4. **Contact hosting support** if mod_rewrite issues
5. **Share console errors** for specific debugging

## ✅ **Success Indicators**

Your website is working correctly when:

- ✅ Website loads without console errors
- ✅ `window.debugTMDB()` shows all green checkmarks
- ✅ Movie posters display correctly
- ✅ Search functionality works
- ✅ No 404/500 errors in Network tab 
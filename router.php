<?php
// Router script for PHP development server
// This handles URL rewriting since .htaccess doesn't work with built-in PHP server

$requestUri = $_SERVER['REQUEST_URI'];
$requestPath = parse_url($requestUri, PHP_URL_PATH);

// Handle API routes first
if (preg_match('#^/api/tmdb/(.*)#', $requestPath, $matches)) {
    // Set up the environment to simulate the rewritten request
    $_SERVER['REQUEST_URI'] = '/api/tmdb/' . $matches[1] . '?' . ($_SERVER['QUERY_STRING'] ?? '');
    
    // Include the API handler
    require_once __DIR__ . '/api/tmdb.php';
    return true;
}

// Handle static files
$filePath = __DIR__ . $requestPath;

// If it's a real file, serve it
if (is_file($filePath)) {
    // Let PHP serve the file with default handling
    return false;
}

// Don't serve React app for asset requests that don't exist
if (preg_match('#\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$#i', $requestPath)) {
    http_response_code(404);
    echo "File not found: " . $requestPath;
    return true;
}

// Don't serve React app for API requests that don't exist
if (preg_match('#^/api/#', $requestPath)) {
    http_response_code(404);
    echo "API endpoint not found: " . $requestPath;
    return true;
}

// For everything else (React Router routes), serve the React app
require_once __DIR__ . '/index.html';
return true;
?>
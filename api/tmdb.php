<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Load configuration
$config = require_once 'config.php';

// Get the API key from config
$apiKey = $config['tmdb_api_key'];

if (empty($apiKey)) {
    http_response_code(500);
    echo json_encode(['error' => 'API key not configured']);
    exit();
}

// Get the request path and query parameters
$requestUri = $_SERVER['REQUEST_URI'];
$parsedUrl = parse_url($requestUri);
$path = $parsedUrl['path'];

// Remove the /api/tmdb prefix from the path
$tmdbPath = preg_replace('#^/api/tmdb#', '', $path);

// Get query parameters
$queryParams = [];
if (isset($parsedUrl['query'])) {
    parse_str($parsedUrl['query'], $queryParams);
}

// Add the API key to query parameters
$queryParams['api_key'] = $apiKey;

// Build the TMDB API URL
$tmdbBaseUrl = 'https://api.themoviedb.org/3';
$tmdbUrl = $tmdbBaseUrl . $tmdbPath . '?' . http_build_query($queryParams);

// Initialize cURL
$ch = curl_init();

// Set cURL options
curl_setopt_array($ch, [
    CURLOPT_URL => $tmdbUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTPHEADER => [
        'Accept: application/json',
        'Content-Type: application/json',
        'User-Agent: MovieTracker/1.0'
    ]
]);

// Execute the request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

curl_close($ch);

// Handle cURL errors
if ($error) {
    http_response_code(500);
    echo json_encode(['error' => 'Request failed: ' . $error]);
    exit();
}

// Set the response code
http_response_code($httpCode);

// Return the response
echo $response;
?> 
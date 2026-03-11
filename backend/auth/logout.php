<?php
// auth/logout.php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once __DIR__ . '/../helpers/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse("Use POST method", 405);
}

/*
 JWT is stateless.
 Logout = client must delete token from storage.
*/
successResponse("Logout successful. Please remove token from client storage.");

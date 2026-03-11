<?php
// auth/login.php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../helpers/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse("Use POST method", 405);
}

$input = json_decode(file_get_contents("php://input"), true);
if (!$input) {
    errorResponse("Invalid JSON body", 400);
}

if (empty(trim($input['email'] ?? '')) || empty($input['password'] ?? '')) {
    errorResponse("Email and password required", 422);
}

$email = strtolower(trim($input['email']));
$pass  = $input['password'];

// ✅ Email format validation
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    errorResponse("Invalid email format", 422);
}


/* Fetch user */
$stmt = $pdo->prepare("SELECT * FROM users WHERE LOWER(email)=?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($pass, $user['password'])) {
    errorResponse("Invalid login credentials", 401);
}

/* All registered users are active, so no status check needed */

/* TOKEN = 1 DAY EXPIRY */
$token = generateToken($user['id'], $user['role'], 86400);

successResponse("Login successful", [
    "token" => $token,
    "role"  => $user['role']
]);

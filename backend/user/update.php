<?php
// user/update.php
// Updates user profile.

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__.'/../config/database.php';
require_once __DIR__.'/../helpers/response.php';
require_once __DIR__.'/../helpers/auth_helper.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse("Use POST method", 405);
}

$user = authenticate();
$userId = $user['user_id'];

$input = json_decode(file_get_contents("php://input"), true);
if (!$input) {
    errorResponse("Invalid JSON body", 400);
}

// At least one field should be present
if (
    empty($input['name']) &&
    empty($input['phone']) &&
    empty($input['email'])
) {
    errorResponse("At least one field required to update", 422);
}

$fields = [];
$params = [];

// Name
if (!empty($input['name'])) {
    $fields[] = "name=?";
    $params[] = strtolower(trim($input['name'])); // lowercase name
}

// Phone
if (!empty($input['phone'])) {
    $phone = strtolower(trim($input['phone'])); // lowercase phone
    $stmt = $pdo->prepare("SELECT id FROM users WHERE phone=? AND id!=?");
    $stmt->execute([$phone, $userId]);
    if ($stmt->fetch()) {
        errorResponse("Phone already exists", 409);
    }
    $fields[] = "phone=?";
    $params[] = $phone;
}

// Email
if (!empty($input['email'])) {
    $email = strtolower(trim($input['email'])); // already lowercase
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email=? AND id!=?");
    $stmt->execute([$email, $userId]);
    if ($stmt->fetch()) {
        errorResponse("Email already exists", 409);
    }
    $fields[] = "email=?";
    $params[] = $email;
}

// Update
$sql = "UPDATE users SET " . implode(", ", $fields) . " WHERE id=?";
$params[] = $userId;

$stmt = $pdo->prepare($sql);
$stmt->execute($params);

// Fetch updated user data
$stmt = $pdo->prepare("SELECT id, name, email, phone FROM users WHERE id=?");
$stmt->execute([$userId]);
$updatedUser = $stmt->fetch(PDO::FETCH_ASSOC);

successResponse("Profile updated", $updatedUser);

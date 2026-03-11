<?php
// user/profile.php
// Shows own profile.
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


require_once __DIR__.'/../config/database.php';
require_once __DIR__.'/../helpers/response.php';
require_once __DIR__.'/../helpers/auth_helper.php';

// Authenticate user via JWT (status check illa)
$user = authenticate();
$userId = $user['user_id'];

// Fetch user + profile details
$stmt = $pdo->prepare("
    SELECT 
        u.id, u.name, u.email, u.phone, u.role, u.status,
        u.created_at, u.updated_at,
        p.photo, p.location, p.description
    FROM users u
    LEFT JOIN user_profiles p ON p.user_id = u.id
    WHERE u.id = ?
");
$stmt->execute([$userId]);
$profile = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$profile) {
    errorResponse("User not found", 404);
}

// If multiple photos stored as CSV → convert to array
if (!empty($profile['photo'])) {
    $profile['photo'] = explode(",", $profile['photo']);
} else {
    $profile['photo'] = [];
}

// Return profile
successResponse("Profile retrieved", $profile);

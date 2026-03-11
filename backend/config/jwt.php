<?php
// config/jwt.php
// JWT creation and verification.

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

require_once __DIR__ . '/../vendor/autoload.php';

$jwt_secret = "your_jwt_secret_key";
$jwt_issuer = "your_project_backend";
$jwt_expire = 60 * 60 * 24; // 24 hours

function generateToken($user_id, $role) {
    global $jwt_secret, $jwt_issuer, $jwt_expire;

    $payload = [
        "iss" => $jwt_issuer,
        "iat" => time(),
        "exp" => time() + $jwt_expire,
        "user_id" => $user_id,
        "role" => $role
    ];

    return JWT::encode($payload, $jwt_secret, "HS256");
}

function verifyToken($token) {
    global $jwt_secret;
    try {
        return (array) JWT::decode($token, new Key($jwt_secret, "HS256"));
    } catch (\Exception $e) {
        return false;
    }
}

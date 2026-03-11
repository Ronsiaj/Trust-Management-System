<?php
// helpers/auth_helper.php
// JWT validation and role-based access.

require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/response.php';

function getBearerToken() {
    $headers = function_exists('apache_request_headers')
        ? apache_request_headers()
        : getallheaders();

    if (empty($headers['Authorization'])) {
        errorResponse("Authorization header missing", 401);
    }

    if (!preg_match('/Bearer\s+(\S+)/', $headers['Authorization'], $matches)) {
        errorResponse("Invalid Authorization format", 401);
    }

    return $matches[1];
}

function authenticate() {
    $token = getBearerToken();
    $payload = verifyToken($token);

    if (!$payload || !is_array($payload)) {
        errorResponse("Invalid or expired token", 401);
    }

    // Normalize key: always use user_id
    if (isset($payload['id']) && !isset($payload['user_id'])) {
        $payload['user_id'] = $payload['id'];
        unset($payload['id']);
    }

    if (empty($payload['user_id']) || empty($payload['role'])) {
        errorResponse("Invalid token payload", 401);
    }

    return $payload; // ['user_id'=>..,'role'=>..]
}

function authorize($roles = []) {
    $user = authenticate();

    if (!empty($roles) && !in_array($user['role'], $roles)) {
        errorResponse("Unauthorized access", 403);
    }

    return $user;
}

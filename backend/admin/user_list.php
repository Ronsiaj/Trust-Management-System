<?php
// admin/user_list.php
// Lists all users with pagination and optional filters.
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

authorize(['admin']);

/* -------------------------------
   METHOD VALIDATION
-------------------------------- */
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    errorResponse("Use GET method", 405);
}

/* -------------------------------
   PAGINATION
-------------------------------- */
$page  = max(1, intval($_GET['page'] ?? 1));
$limit = intval($_GET['limit'] ?? 10);
$limit = $limit > 0 ? $limit : 10;
$offset = ($page - 1) * $limit;

/* -------------------------------
   FILTERS (OPTIONAL)
-------------------------------- */
$where  = [];
$params = [];

/* Role validation */
$valid_roles = ['user','donor','admin'];
if (!empty($_GET['role'])) {
    $role = strtolower($_GET['role']);
    if (!in_array($role, $valid_roles)) {
        errorResponse("Invalid role filter. Allowed: user, donor, admin", 422);
    }
    $where[] = "role = ?";
    $params[] = $role;
}

/* Status validation */
$valid_status = ['active','inactive','deleted'];
if (!empty($_GET['status'])) {
    $status = strtolower($_GET['status']);
    if (!in_array($status, $valid_status)) {
        errorResponse("Invalid status filter. Allowed: active, inactive, deleted", 422);
    }
    $where[] = "status = ?";
    $params[] = $status;
}

$where_sql = $where ? "WHERE " . implode(" AND ", $where) : "";

try {

    /* ---------- TOTAL COUNT ---------- */
    $countStmt = $pdo->prepare("
        SELECT COUNT(*) 
        FROM users
        $where_sql
    ");
    foreach ($params as $k => $v) {
        $countStmt->bindValue($k + 1, $v);
    }
    $countStmt->execute();
    $total = (int)$countStmt->fetchColumn();

    /* ---------- DATA QUERY ---------- */
    $stmt = $pdo->prepare("
        SELECT id, name, email, phone, role, status, created_at
        FROM users
        $where_sql
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
    ");
    foreach ($params as $k => $v) {
        $stmt->bindValue($k + 1, $v);
    }
    $stmt->bindValue(count($params) + 1, $limit, PDO::PARAM_INT);
    $stmt->bindValue(count($params) + 2, $offset, PDO::PARAM_INT);
    $stmt->execute();

    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    /* ---------- RESPONSE ---------- */
    successResponse("User list", [
        "list" => $users,
        "pagination" => [
            "page"        => $page,
            "limit"       => $limit,
            "total"       => $total,
            "total_pages" => ceil($total / $limit)
        ]
    ]);

} catch (PDOException $e) {
    errorResponse("Database error: " . $e->getMessage(), 500);
}

<?php
// admin/email_status.php
// Lists email logs with filters and pagination.
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

if (!empty($_GET['type'])) {
    $where[]  = "type = ?";
    $params[] = $_GET['type'];
}

if (!empty($_GET['status'])) {
    $where[]  = "status = ?";
    $params[] = $_GET['status']; // sent / failed
}

if (!empty($_GET['user_id'])) {
    $where[]  = "user_id = ?";
    $params[] = (int)$_GET['user_id'];
}

$where_sql = $where ? "WHERE " . implode(" AND ", $where) : "";

try {

    /* ---------- TOTAL COUNT ---------- */
    $countStmt = $pdo->prepare("
        SELECT COUNT(*) 
        FROM email_logs
        $where_sql
    ");
    foreach ($params as $k => $v) {
        $countStmt->bindValue($k + 1, $v);
    }
    $countStmt->execute();
    $total = (int)$countStmt->fetchColumn();

    /* ---------- DATA QUERY ---------- */
    $stmt = $pdo->prepare("
        SELECT id, user_id, type, subject, status, created_at
        FROM email_logs
        $where_sql
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
    ");

    // Bind filter params first
    foreach ($params as $k => $v) {
        $stmt->bindValue($k + 1, $v);
    }

    // Bind limit and offset last (positional)
    $stmt->bindValue(count($params) + 1, $limit, PDO::PARAM_INT);
    $stmt->bindValue(count($params) + 2, $offset, PDO::PARAM_INT);

    $stmt->execute();

    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    /* ---------- RESPONSE ---------- */
    successResponse("Email logs", [
        "list" => $logs,
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

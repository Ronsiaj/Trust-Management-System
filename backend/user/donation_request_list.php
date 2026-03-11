<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth_helper.php';

/* -------------------------------
   METHOD VALIDATION
-------------------------------- */
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Method not allowed"
    ]);
    exit;
}

/* -------------------------------
   READ QUERY PARAMS
-------------------------------- */
$status = $_GET['status'] ?? '';
$mode   = $_GET['mode'] ?? '';   // ✅ NEW (donate mode)
$page   = max(1, (int)($_GET['page'] ?? 1));
$limit  = (int)($_GET['limit'] ?? 10);
$limit  = $limit > 0 ? $limit : 10;
$offset = ($page - 1) * $limit;

/* -------------------------------
   AUTH LOGIC
   - Public can only see completed
   - Otherwise login required
-------------------------------- */
$role = "public";
$authUserId = 0;

if ($status !== "completed") {
    // Any request other than completed → must be logged in
    $user = authorize(['donor', 'user', 'admin']);
    $role = strtolower($user['role']);
    $authUserId = (int)$user['user_id'];
}

/* -------------------------------
   FILTERS
-------------------------------- */
$where  = [];
$params = [];

/* ---------- PUBLIC DONATORS PAGE ---------- */
if ($role === "public") {
    // Public must see ONLY completed
    $where[] = "d.status = ?";
    $params[] = "completed";
}

/* ---------- USER ---------- */
if ($role === "user") {

    // ✅ If user is opening Donate page
    // then show approved requests (not only his own)
    if ($mode === "donate") {

        $where[] = "d.status = ?";
        $params[] = "approved";

    } else {

        // Logged-in user sees only their own requests
        $where[] = "d.user_id = ?";
        $params[] = $authUserId;

        // User can optionally filter by status
        if (!empty($status)) {
            $where[] = "d.status = ?";
            $params[] = $status;
        }
    }
}

/* ---------- DONOR & ADMIN ---------- */
if (in_array($role, ["donor", "admin"])) {

    // Donor/Admin can see all requests
    if (!empty($status)) {
        $where[] = "d.status = ?";
        $params[] = $status;
    }

    // Optional user_id filter
    if (!empty($_GET['user_id'])) {
        $where[] = "d.user_id = ?";
        $params[] = (int)$_GET['user_id'];
    }
}

$where_sql = $where ? "WHERE " . implode(" AND ", $where) : "";

try {

    /* -------------------------------
       TOTAL COUNT
    -------------------------------- */
    $countStmt = $pdo->prepare("
        SELECT COUNT(*)
        FROM donations d
        LEFT JOIN users u ON d.user_id = u.id
        $where_sql
    ");

    foreach ($params as $k => $v) {
        $countStmt->bindValue($k + 1, $v);
    }

    $countStmt->execute();
    $total = (int)$countStmt->fetchColumn();

    /* -------------------------------
       DATA QUERY
    -------------------------------- */
    $stmt = $pdo->prepare("
        SELECT 
            d.id,
            d.user_id,
            d.photo,
            d.description,
            d.amount,
            d.phone,
            d.location,
            d.status,
            d.created_at,
            u.name  AS user_name,
            u.email AS user_email,

            -- ✅ total paid
            COALESCE((
                SELECT SUM(p.amount)
                FROM payments p
                WHERE p.donation_id = d.id
                AND p.status='success'
            ), 0) AS total_paid,

            -- ✅ remaining / pending
            (d.amount - COALESCE((
                SELECT SUM(p.amount)
                FROM payments p
                WHERE p.donation_id = d.id
                AND p.status='success'
            ), 0)) AS remaining_amount

        FROM donations d
        LEFT JOIN users u ON d.user_id = u.id
        $where_sql
        ORDER BY d.created_at DESC
        LIMIT ? OFFSET ?
    ");

    foreach ($params as $k => $v) {
        $stmt->bindValue($k + 1, $v);
    }

    $stmt->bindValue(count($params) + 1, $limit, PDO::PARAM_INT);
    $stmt->bindValue(count($params) + 2, $offset, PDO::PARAM_INT);

    $stmt->execute();

    successResponse("Donation list", [
        "list" => $stmt->fetchAll(PDO::FETCH_ASSOC),
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

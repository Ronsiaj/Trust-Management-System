<?php
// admin/payment_list.php
// Lists all payments with donor info and donation request info.
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

if (!empty($_GET['status'])) {
    $where[]  = "p.status = ?";
    $params[] = $_GET['status'];
}

if (!empty($_GET['donor_id'])) {
    $where[]  = "p.donor_id = ?";
    $params[] = (int)$_GET['donor_id'];
}

if (!empty($_GET['donation_id'])) {
    $where[]  = "p.donation_id = ?";
    $params[] = (int)$_GET['donation_id'];
}

if (!empty($_GET['payment_id'])) {
    $where[]  = "p.id = ?";
    $params[] = (int)$_GET['payment_id'];
}

$where_sql = $where ? "WHERE " . implode(" AND ", $where) : "";

try {

    /* ---------- TOTAL COUNT ---------- */
    $countStmt = $pdo->prepare("
        SELECT COUNT(*) 
        FROM payments p
        LEFT JOIN users u ON p.donor_id = u.id
        LEFT JOIN donations d ON p.donation_id = d.id
        $where_sql
    ");
    foreach ($params as $k => $v) {
        $countStmt->bindValue($k + 1, $v);
    }
    $countStmt->execute();
    $total = (int)$countStmt->fetchColumn();

    /* ---------- DATA QUERY ---------- */
    $stmt = $pdo->prepare("
        SELECT 
            p.id,
            p.amount,
            p.payment_date,
            p.status,
            p.razorpay_payment_id,
            u.name  AS donor_name,
            u.email AS donor_email,
            d.description AS donation_description,
            d.amount      AS donation_amount

            
        FROM payments p
        LEFT JOIN users u ON p.donor_id = u.id
        LEFT JOIN donations d ON p.donation_id = d.id
        $where_sql
        ORDER BY p.payment_date DESC
        LIMIT ? OFFSET ?
    ");

    foreach ($params as $k => $v) {
        $stmt->bindValue($k + 1, $v);
    }
    $stmt->bindValue(count($params) + 1, $limit, PDO::PARAM_INT);
    $stmt->bindValue(count($params) + 2, $offset, PDO::PARAM_INT);
    $stmt->execute();

    $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    /* ---------- RESPONSE ---------- */
    successResponse("Payment list", [
        "list" => $payments,
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

<?php
// open/donation_requests.php
// Public API to list donation requests with donors (no sensitive info)

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/helpers/response.php';

// Get pagination parameters
$page = max(1, intval($_GET['page'] ?? 1));
$limit = 10;
$offset = ($page - 1) * $limit;

// ✅ NEW: sort (latest/oldest)
$sort = strtolower(trim($_GET['sort'] ?? 'latest'));
$orderBy = "ORDER BY d.created_at DESC"; // default latest

if ($sort === "oldest") {
    $orderBy = "ORDER BY d.created_at ASC";
}

// Filters
$where = [];
$params = [];

// ✅ Always show only approved requests
$where[] = "d.status = :status";
$params[':status'] = "approved";


// Combine WHERE clause
$where_sql = $where ? "WHERE " . implode(" AND ", $where) : "";

// Fetch donation requests with donors info (exclude sensitive info)
$stmt = $pdo->prepare("
    SELECT 
        d.id AS donation_id,
        d.user_id AS requestor_id,
        u.name AS requestor_name,
        d.photo,                               -- ✅ ADDED (request photo)
        d.description,
        d.amount AS requested_amount,
        d.status,
        d.created_at,
        IFNULL(SUM(p.amount), 0) AS total_donated,
        GROUP_CONCAT(CONCAT(p.donor_id, ':', p.amount) SEPARATOR ',') AS donors
    FROM donations d
    LEFT JOIN users u ON d.user_id = u.id
    LEFT JOIN payments p ON d.id = p.donation_id AND p.status='success'
    $where_sql
    GROUP BY d.id
    $orderBy
    LIMIT :limit OFFSET :offset
");

// Bind limit and offset
$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

// Bind other parameters (status)
foreach ($params as $key => $value) {
    $stmt->bindValue($key, $value);
}

$stmt->execute();
$donations = $stmt->fetchAll();

successResponse("Donation requests list", [
    "page" => $page,
    "limit" => $limit,
    "donations" => $donations
]);

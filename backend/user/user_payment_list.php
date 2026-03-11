<?php
// user/user_payment_list.php
// Lists payments of logged-in user.
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

$user = authenticate();

$page = max(1, intval($_GET['page'] ?? 1));
$limit = 10;
$offset = ($page - 1) * $limit;

$where = "donor_id = ?";
$params = [$user['user_id']];

// Optional date filter (ensure valid format)
if (!empty($_GET['from']) && !empty($_GET['to'])) {
    $from = $_GET['from'];
    $to   = $_GET['to'];

    // Optional: validate date format YYYY-MM-DD
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $from) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $to)) {
        errorResponse("Invalid date format. Use YYYY-MM-DD", 422);
    }

    $where .= " AND payment_date BETWEEN ? AND ?";
    $params[] = $from;
    $params[] = $to;
}

$sql = "
SELECT id, donation_id, donor_id, amount, payment_date, razorpay_payment_id, status, created_at
FROM payments
WHERE $where
ORDER BY payment_date DESC
LIMIT ? OFFSET ?
";

$stmt = $pdo->prepare($sql);

/* Bind all parameters positionally */
$i = 1;
foreach ($params as $p) {
    $stmt->bindValue($i++, $p);
}

/* Bind limit and offset as integers */
$stmt->bindValue($i++, (int)$limit, PDO::PARAM_INT);
$stmt->bindValue($i++, (int)$offset, PDO::PARAM_INT);

$stmt->execute();

successResponse("Payment list", [
    "list" => $stmt->fetchAll(PDO::FETCH_ASSOC),
    "pagination" => [
        "page" => $page,
        "limit" => $limit
    ]
]);

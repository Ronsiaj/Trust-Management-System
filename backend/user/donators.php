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

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Method not allowed"
    ]);
    exit;
}

$page   = max(1, (int)($_GET['page'] ?? 1));
$limit  = (int)($_GET['limit'] ?? 10);
$limit  = $limit > 0 ? $limit : 10;
$offset = ($page - 1) * $limit;

try {

    $countStmt = $pdo->prepare("
        SELECT COUNT(*)
        FROM payments p
        INNER JOIN donations d ON p.donation_id = d.id
        INNER JOIN users donor ON p.donor_id = donor.id
    ");
    $countStmt->execute();
    $total = (int)$countStmt->fetchColumn();

    $stmt = $pdo->prepare("
        SELECT 
            p.id,
            p.amount AS donated_amount,
            p.created_at,

            donor.name AS donor_name,

            d.photo,
            d.description,
            d.location
        FROM payments p
        INNER JOIN donations d ON p.donation_id = d.id
        INNER JOIN users donor ON p.donor_id = donor.id
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
    ");

    $stmt->bindValue(1, $limit, PDO::PARAM_INT);
    $stmt->bindValue(2, $offset, PDO::PARAM_INT);
    $stmt->execute();

    successResponse("Donators list", [
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
?>

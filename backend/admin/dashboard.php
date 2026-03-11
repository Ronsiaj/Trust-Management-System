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

authorize(['admin']); // only admin

try {

    $period = $_GET['period'] ?? '';
    $fromDate = $_GET['fromDate'] ?? '';
    $toDate = $_GET['toDate'] ?? '';

    $params = [];
    $paymentsWhere = "";
    $donationsWhere = "";

    // ======== PERIOD FILTER ========
    if ($period === "today") {
        $paymentsWhere = " AND created_at >= CURDATE() AND created_at < CURDATE() + INTERVAL 1 DAY ";
        $donationsWhere = $paymentsWhere;
    } elseif ($period === "last_3_days") {
        $paymentsWhere = " AND created_at >= CURDATE() - INTERVAL 2 DAY ";
        $donationsWhere = $paymentsWhere;
    } elseif ($period === "last_month") {
        $paymentsWhere = " AND created_at >= DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH,'%Y-%m-01') 
                           AND created_at < DATE_FORMAT(CURDATE(),'%Y-%m-01') ";
        $donationsWhere = $paymentsWhere;
    } elseif ($period === "last_3_months") {
        $paymentsWhere = " AND created_at >= DATE_FORMAT(CURDATE() - INTERVAL 3 MONTH,'%Y-%m-01') 
                           AND created_at < DATE_FORMAT(CURDATE(),'%Y-%m-01') ";
        $donationsWhere = $paymentsWhere;
    } elseif ($period === "last_year") {
        $paymentsWhere = " AND YEAR(created_at) = YEAR(CURDATE()) - 1 ";
        $donationsWhere = $paymentsWhere;
    } elseif ($period === "custom" && $fromDate && $toDate) {
        $paymentsWhere = " AND created_at >= :fromDate AND created_at <= :toDateEnd ";
        $donationsWhere = $paymentsWhere;
        $params[':fromDate'] = $fromDate . " 00:00:00";
        $params[':toDateEnd'] = $toDate . " 23:59:59";
    }

    // ======== STATS ========
    $total_stmt = $pdo->prepare("SELECT IFNULL(SUM(amount),0) AS total_amount FROM payments WHERE status='success' $paymentsWhere");
    $total_stmt->execute($params);
    $total_donations_received = (float)$total_stmt->fetch(PDO::FETCH_ASSOC)['total_amount'];

    $payments_count_stmt = $pdo->prepare("SELECT COUNT(*) FROM payments WHERE status='success' $paymentsWhere");
    $payments_count_stmt->execute($params);
    $total_payments = (int)$payments_count_stmt->fetchColumn();

    $donation_total_stmt = $pdo->prepare("SELECT COUNT(*) FROM donations WHERE 1=1 $donationsWhere");
    $donation_total_stmt->execute($params);
    $total_requests = (int)$donation_total_stmt->fetchColumn();

    $pending_stmt = $pdo->prepare("SELECT COUNT(*) FROM donations WHERE status='pending' $donationsWhere");
    $pending_stmt->execute($params);
    $pending_requests = (int)$pending_stmt->fetchColumn();

    $approved_stmt = $pdo->prepare("SELECT COUNT(*) FROM donations WHERE status='approved' $donationsWhere");
    $approved_stmt->execute($params);
    $approved_requests = (int)$approved_stmt->fetchColumn();

    $rejected_stmt = $pdo->prepare("SELECT COUNT(*) FROM donations WHERE status='rejected' $donationsWhere");
    $rejected_stmt->execute($params);
    $rejected_requests = (int)$rejected_stmt->fetchColumn();


    $completed_stmt = $pdo->prepare("SELECT COUNT(*) FROM donations WHERE status='completed' $donationsWhere");
    $completed_stmt->execute($params);
    $completed_requests = (int)$completed_stmt->fetchColumn();

    // ======== RECENT REQUESTS ========
    $recent_requests_stmt = $pdo->prepare("
        SELECT id, description, amount, status, created_at 
        FROM donations 
        WHERE 1=1 $donationsWhere 
        ORDER BY created_at DESC 
        LIMIT 5
    ");
    $recent_requests_stmt->execute($params);
    $recent_requests = $recent_requests_stmt->fetchAll(PDO::FETCH_ASSOC);

    // ======== RECENT PAYMENTS ========
    $recent_payments_stmt = $pdo->prepare("
        SELECT id, donation_id, amount, status, razorpay_payment_id, created_at
        FROM payments 
        WHERE status='success' $paymentsWhere
        ORDER BY created_at DESC 
        LIMIT 20
    ");
    $recent_payments_stmt->execute($params);
    $recent_payments = $recent_payments_stmt->fetchAll(PDO::FETCH_ASSOC);

    // ======== DONATION CHART ========
    $chart_stmt = $pdo->prepare("
        SELECT DATE(created_at) AS date, IFNULL(SUM(amount),0) AS amount 
        FROM payments 
        WHERE status='success' $paymentsWhere
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at) ASC
    ");
    $chart_stmt->execute($params);
    $chart_data = $chart_stmt->fetchAll(PDO::FETCH_ASSOC);

    $final_chart = [];
    foreach ($chart_data as $row) {
        $final_chart[] = [
            "date" => $row["date"],
            "amount" => (float)$row["amount"]
        ];
    }

    // ======== RESPONSE ========
    successResponse("Dashboard data", [
        "stats" => [
            "total_donations_received" => $total_donations_received,
            "total_payments" => $total_payments,
            "requests" => [
                "total" => $total_requests,
                "pending" => $pending_requests,
                "approved" => $approved_requests,
                "rejected" => $rejected_requests, 
                "completed" => $completed_requests
            ],
        ],
        "donation_chart" => $final_chart,
        "recent_requests" => $recent_requests,
        "recent_payments" => $recent_payments
    ]);

} catch (PDOException $e) {
    errorResponse("Database error: " . $e->getMessage(), 500);
}

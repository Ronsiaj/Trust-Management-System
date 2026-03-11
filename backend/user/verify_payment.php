<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__.'/../config/database.php';
require_once __DIR__.'/../config/razorpay.php';
require_once __DIR__.'/../helpers/response.php';
require_once __DIR__.'/../helpers/auth_helper.php';
require_once __DIR__.'/../vendor/autoload.php';

use Razorpay\Api\Api;
use Razorpay\Api\Errors\SignatureVerificationError;

$user = authorize(['user','donor']); // must be logged in
$donor_id = $user['user_id'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse("Use POST method", 405);
}

$input = json_decode(file_get_contents("php://input"), true);

if (
    empty($input['razorpay_payment_id']) ||
    empty($input['razorpay_order_id']) ||
    empty($input['razorpay_signature'])
) {
    errorResponse("Payment data missing", 422);
}

$payment_id = $input['razorpay_payment_id'];
$order_id   = $input['razorpay_order_id'];
$signature  = $input['razorpay_signature'];

$api = new Api(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET);

/* ---------- VERIFY SIGNATURE ---------- */
try {
    $api->utility->verifyPaymentSignature([
        'razorpay_order_id'   => $order_id,
        'razorpay_payment_id' => $payment_id,
        'razorpay_signature'  => $signature
    ]);
} catch (SignatureVerificationError $e) {
    // If verification fails, log the failed payment
    $order = $api->order->fetch($order_id);
    $notes = $order['notes'] ?? [];
    $donation_id = $notes['donation_id'] ?? null;
    $amount      = floatval($notes['amount'] ?? 0);

    $stmt = $pdo->prepare("
        INSERT INTO payments
        (donation_id, donor_id, amount, razorpay_orderid, razorpay_payment_id, status, created_at)
        VALUES(?,?,?,?,?, 'failed', NOW())
    ");
    $stmt->execute([
        $donation_id,
        $donor_id,
        $amount,
        $order_id,
        $payment_id
    ]);

    errorResponse("Payment verification failed", 400);
}

/* ---------- PAYMENT SUCCESS ---------- */
// Get donation info from Razorpay order notes
$order = $api->order->fetch($order_id);
$notes = $order['notes'] ?? [];
$donation_id = $notes['donation_id'] ?? null;
$amount      = floatval($notes['amount'] ?? 0);

if (!$donation_id || $amount <= 0) {
    errorResponse("Invalid payment order data", 400);
}

$pdo->beginTransaction();
try {
    // Lock donation row for safe update
    $donStmt = $pdo->prepare("
        SELECT remaining_amount, status
        FROM donations
        WHERE id = ? 
        FOR UPDATE
    ");
    $donStmt->execute([$donation_id]);
    $donation = $donStmt->fetch();

    if (!$donation) {
        throw new Exception("Invalid donation request");
    }

    if ($donation['status'] === 'completed') {
        throw new Exception("Donation already completed");
    }

    if ($amount > $donation['remaining_amount']) {
        throw new Exception("Donation amount exceeds remaining amount");
    }

    // Reduce remaining amount
    $newRemaining = $donation['remaining_amount'] - $amount;
    $newStatus = ($newRemaining <= 0) ? 'completed' : $donation['status'];

    // Update donation
    $upd = $pdo->prepare("
        UPDATE donations
        SET remaining_amount = ?, status = ?
        WHERE id = ?
    ");
    $upd->execute([$newRemaining, $newStatus, $donation_id]);

    // Insert payment record
    $pay = $pdo->prepare("
        INSERT INTO payments
        (donation_id, donor_id, amount, razorpay_orderid, razorpay_payment_id, status, created_at)
        VALUES(?,?,?,?,?, 'success', NOW())
    ");
    $pay->execute([
        $donation_id,
        $donor_id,
        $amount,
        $order_id,
        $payment_id
    ]);

    $pdo->commit();

} catch (Exception $e) {
    $pdo->rollBack();
    errorResponse($e->getMessage(), 400);
}

successResponse("Payment verified, amount updated successfully", [
    "donation_id" => $donation_id,
    "paid_amount" => $amount,
    "remaining_amount" => $newRemaining,
    "status" => $newStatus
]);

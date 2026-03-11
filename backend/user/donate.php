<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

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

/* ---------------- AUTH REQUIRED ---------------- */
$user = authorize(['user','donor']); // must login
$donor_id = $user['user_id'];

/* ---------------- CHECK METHOD ---------------- */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse("Use POST method", 405);
}

/* ---------------- GET INPUT ---------------- */
$input = json_decode(file_get_contents("php://input"), true);

/* ---------------- INITIALIZE $donation_id ---------------- */
$donation_id = $input['donation_id'] ?? null;

/* ---------------- HANDLE NEW DONATION CREATION ---------------- */
$is_new_donation = empty($donation_id); // if donation_id not sent, create new

if ($is_new_donation) {
    // Validate required fields for new donation
    $amount = round(floatval($input['amount'] ?? 0), 2);
    if ($amount <= 0) errorResponse("Donation amount required", 422);

    $description = trim($input['description'] ?? '');
    if (!$description) errorResponse("Donation description required", 422);

    $photo = trim($input['photo'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $location = trim($input['location'] ?? '');

    // Insert donation with remaining_amount = amount
    $stmt = $pdo->prepare("
        INSERT INTO donations
        (user_id, photo, description, amount, remaining_amount, phone, location, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    ");

    $stmt->execute([
        $donor_id,
        $photo,
        $description,
        $amount,
        $amount, // <-- Key fix: remaining_amount = amount
        $phone,
        $location
    ]);

    $donation_id = $pdo->lastInsertId(); // now $donation_id is always set
}

/* ---------------- VALIDATE EXISTING DONATION ---------------- */
$chk = $pdo->prepare("
    SELECT remaining_amount, status
    FROM donations
    WHERE id = ?
");
$chk->execute([$donation_id]);
$donation = $chk->fetch();

if (!$donation) {
    errorResponse("Invalid donation request", 404);
}

if ($donation['status'] === 'completed') {
    errorResponse("Donation already completed", 400);
}

$amount = round(floatval($input['amount'] ?? 0), 2);
if ($amount <= 0) errorResponse("Amount required", 422);

if ($donation['remaining_amount'] <= 0) {
    errorResponse("Donation amount already fulfilled", 400);
}

if ($amount > $donation['remaining_amount']) {
    errorResponse("Amount exceeds remaining donation amount", 422);
}

/* ---------------- FORCE ROLE = DONOR ---------------- */
$pdo->prepare("UPDATE users SET role='donor', status='active' WHERE id=?")
    ->execute([$donor_id]);

/* ---------------- CREATE RAZORPAY ORDER ---------------- */
try {
    $api = new Api(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET);

    $order = $api->order->create([
        'amount'   => $amount * 100,
        'currency' => 'INR',
        'receipt'  => uniqid('don_'),
        'notes' => [
            'donor_id'    => $donor_id,
            'donation_id' => $donation_id,
            'amount'      => $amount
        ]
    ]);

    successResponse("Order created successfully", [
        "order_id"    => $order['id'],
        "amount"      => $order['amount'],
        "currency"    => $order['currency'],
        "donor_id"    => $donor_id,
        "donation_id" => $donation_id,
        "key"         => RAZORPAY_KEY_ID
    ]);

} catch (\Razorpay\Api\Errors\Error $e) {
    errorResponse("Razorpay error: ".$e->getMessage(), 500);
}

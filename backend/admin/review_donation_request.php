<?php
// admin/review_donation_request.php
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
require_once __DIR__.'/../helpers/response.php';
require_once __DIR__.'/../helpers/auth_helper.php';
require_once __DIR__.'/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// ---------------- AUTH ----------------
authorize(['admin']); // Only admin can access

// ---------------- METHOD VALIDATION ----------------
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse("Use POST method", 405);
}

// ---------------- GET INPUT ----------------
$input = json_decode(file_get_contents("php://input"), true);
$donation_id = isset($input['donation_id']) ? intval($input['donation_id']) : 0;
$action      = isset($input['action']) ? strtolower(trim($input['action'])) : '';

if (!$donation_id || !$action) {
    errorResponse("donation_id and action are required", 422);
}

// ---------------- VALIDATE ACTION ----------------
$valid_actions = ['approve', 'reject'];
if (!in_array($action, $valid_actions)) {
    errorResponse("Invalid action. Allowed: approve, reject", 422);
}

// ---------------- FETCH DONATION ----------------
$stmt = $pdo->prepare("
    SELECT d.id, d.user_id, d.description, d.amount, u.name, u.email
    FROM donations d
    JOIN users u ON d.user_id = u.id
    WHERE d.id = ? AND d.status = 'pending'
");
$stmt->execute([$donation_id]);
$donation = $stmt->fetch();

if (!$donation) {
    errorResponse("Pending donation request not found", 404);
}

// ---------------- MAP ACTION TO STATUS ----------------
$status_map = [
    'approve' => 'approved',
    'reject'  => 'rejected'
];
$new_status = $status_map[$action];

// ---------------- UPDATE DONATION ----------------
try {
    $update = $pdo->prepare("UPDATE donations SET status = ? WHERE id = ?");
    $update->execute([$new_status, $donation_id]);

    if ($update->rowCount() === 0) {
        errorResponse("Failed to update donation status", 500);
    }
} catch (Exception $e) {
    errorResponse("Database error: ".$e->getMessage(), 500);
}

// ---------------- EMAIL NOTIFICATION ----------------
if (!empty($donation['email'])) {
    $mail = new PHPMailer(true);
    $mailStatus = '';
    $response_text = '';

    try {
        $mail->isSMTP();
        $mail->Host       = "your_smtp_host";
        $mail->SMTPAuth   = true;
        $mail->Username   = "your_email@example.com";
        $mail->Password   = "your_email_password";
        $mail->SMTPSecure = "tls";
        $mail->Port       = 587;

        $mail->setFrom("your_email@example.com", "Helping Hands Trsut");
        $mail->addAddress($donation['email'], $donation['name']);
        $mail->isHTML(true);

        if ($action === 'approve') {
            $subject = "Your Donation Request Has Been Approved";
            $message = "Your donation request for <b>{$donation['description']}</b> (₹{$donation['amount']}) has been approved. Thank you for your support.";
        } else { // reject
            $subject = "Your Donation Request Has Been Rejected";
            $message = "Your donation request for <b>{$donation['description']}</b> (₹{$donation['amount']}) has been rejected. Please contact support for details.";
        }

        $mail->Subject = $subject;
        $mail->Body = "
        <p>Dear {$donation['name']},</p>
        <p>{$message}</p>
        <br>
        <p>Regards,<br>Helping Hands Trust</p>
        ";

        $mail->send();
        $mailStatus = 'sent';
        $response_text = 'Mail sent successfully';

    } catch (Exception $e) {
        $mailStatus = 'failed';
        $response_text = $mail->ErrorInfo ?: $e->getMessage();
    }

    // Log email
    $log = $pdo->prepare("
        INSERT INTO email_logs(user_id,type,subject,status,response_text,created_at)
        VALUES(?,?,?,?,?,NOW())
    ");
    $log->execute([
        $donation['user_id'],
        'donation_review',
        $subject,
        $mailStatus,
        $response_text
    ]);
}

// ---------------- RESPONSE ----------------
successResponse("Donation request {$new_status} successfully", [
    "donation_id" => $donation_id,
    "status"      => $new_status
]);

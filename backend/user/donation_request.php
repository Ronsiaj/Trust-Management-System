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
require_once __DIR__.'/../helpers/response.php';
require_once __DIR__.'/../helpers/auth_helper.php';
require_once __DIR__.'/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

/* Authorize user */
$user = authorize(['user']);
$userId = $user['user_id'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse("Use POST method", 405);
}

/* Required fields */
$fields = ['description','amount','upi_id','bank_account_number','ifsc','phone','location'];
foreach ($fields as $f) {
    if (!isset($_POST[$f]) || empty(trim($_POST[$f]))) {
        errorResponse("Missing field: $f", 422);
    }
}

/* Convert all text fields to lowercase */
$description = strtolower(trim($_POST['description']));
$amount = round(floatval($_POST['amount']), 2);
$upi_id = strtolower(trim($_POST['upi_id']));
$bank_account_number = strtolower(trim($_POST['bank_account_number']));
$ifsc = strtolower(trim($_POST['ifsc']));
$phone = strtolower(trim($_POST['phone']));
$location = strtolower(trim($_POST['location']));

/* Photo validation */
if (!isset($_FILES['photos'])) {
    errorResponse("At least 1 photo required", 422);
}

$files = $_FILES['photos'];

// Fix for single file in Postman
if (!is_array($files['name'])) {
    $files['name'] = [$files['name']];
    $files['tmp_name'] = [$files['tmp_name']];
    $files['size'] = [$files['size']];
    $files['type'] = [$files['type']];
    $files['error'] = [$files['error']];
}

if (empty($files['name'][0])) {
    errorResponse("At least 1 photo required", 422);
}

$count = count($files['name']);
if ($count > 3) errorResponse("Maximum 3 photos only", 422);

$allowed = ['jpg','jpeg','png'];
$storedFiles = [];

for ($i=0; $i<$count; $i++) {
    if ($files['error'][$i] !== 0) {
        errorResponse("Error uploading file: ".$files['name'][$i], 422);
    }

    if ($files['size'][$i] > 10*1024*1024) errorResponse("Each image must be below 10MB", 422);
    $ext = strtolower(pathinfo($files['name'][$i], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowed)) errorResponse("Invalid image type: ".$files['name'][$i], 422);
}

/* Duplicate check */
$dup = $pdo->prepare("
SELECT id FROM donations
WHERE user_id=? AND description=? AND amount=? AND DATE(created_at)=CURDATE()
LIMIT 1
");
$dup->execute([$userId, $description, $amount]);
if ($dup->fetch()) errorResponse("You already submitted this same request today", 409);

/* Upload files */
$upload_dir = __DIR__."/../uploads/";
if (!is_dir($upload_dir)) mkdir($upload_dir, 0755, true);
$date = date('Y-m-d');

for ($i=0; $i<$count; $i++) {
    $ext = strtolower(pathinfo($files['name'][$i], PATHINFO_EXTENSION));
    $fname = "user_{$userId}_{$date}_".($i+1).".".$ext;
    move_uploaded_file($files['tmp_name'][$i], $upload_dir.$fname);
    $storedFiles[] = $fname;
}

$photoString = implode(",", $storedFiles);

/* Initialize donation_id variable for response */
$donation_id = null;

try {
    $pdo->beginTransaction();

    /* Insert donation request (lowercase values) with remaining_amount = amount */
    $stmt = $pdo->prepare("
        INSERT INTO donations
        (user_id, photo, description, amount, remaining_amount, phone, location, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    ");
    $stmt->execute([
        $userId,
        $photoString,
        $description,
        $amount,
        $amount, // <-- Key fix: remaining_amount = amount
        $phone,
        $location
    ]);

    /* Capture donation ID for response */
    $donation_id = $pdo->lastInsertId();

    /* Update / Insert user profile (lowercase values) */
    $check = $pdo->prepare("SELECT id FROM user_profiles WHERE user_id=?");
    $check->execute([$userId]);

    if ($check->fetch()) {
        $up = $pdo->prepare("
            UPDATE user_profiles 
            SET photo=?, location=?, description=?, updated_at=NOW()
            WHERE user_id=?
        ");
        $up->execute([$photoString, $location, $description, $userId]);
    } else {
        $ins = $pdo->prepare("
            INSERT INTO user_profiles(user_id, photo, location, description, created_at)
            VALUES (?, ?, ?, ?, NOW())
        ");
        $ins->execute([$userId, $photoString, $location, $description]);
    }

    $pdo->commit();
} catch (Exception $e) {
    $pdo->rollBack();
    errorResponse("Failed to submit request", 500, $e->getMessage());
}

/* Send mail to admins */
$qUser = $pdo->prepare("SELECT name, email, phone FROM users WHERE id=?");
$qUser->execute([$userId]);
$u = $qUser->fetch();

$qAdmin = $pdo->prepare("SELECT email, name FROM users WHERE role='admin' AND status='active'");
$qAdmin->execute();
$admins = $qAdmin->fetchAll();

foreach ($admins as $admin) {
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host       = "your_smtp_host";
        $mail->SMTPAuth   = true;
        $mail->Username   = "your_email@example.com";
        $mail->Password   = "your_email_password";
        $mail->SMTPSecure = "tls";
        $mail->Port       = 587;

        $mail->setFrom("your_email@example.com", "Helping Hands Trust");
        $mail->addAddress($admin['email'], $admin['name']);
        $mail->isHTML(true);
        $mail->Subject = "New Donation Request - Review Needed";

        $mail->Body = "
            <p>Dear {$admin['name']},</p>
            <p><strong>New donation request submitted by:</strong></p>
            <ul>
                <li><strong>Name:</strong> {$u['name']}</li>
                <li><strong>Email:</strong> {$u['email']}</li>
                <li><strong>Phone:</strong> {$u['phone']}</li>
            </ul>
            <p><strong>Donation Details:</strong></p>
            <ul>
                <li><strong>Description:</strong> {$description}</li>
                <li><strong>Amount:</strong> {$amount}</li>
                <li><strong>Location:</strong> {$location}</li>
                <li><strong>Uploaded Photos:</strong> $photoString</li>
                <li><strong>UPI ID:</strong> {$upi_id}</li>
                <li><strong>Bank Account:</strong> {$bank_account_number}</li>
                <li><strong>IFSC:</strong> {$ifsc}</li>
            </ul>
            <p>Please review and approve or reject the request in the system.</p>
            <p>Thank you.</p>
        ";

        $mail->send();
        $mailStatus = 'sent';
        $response_text = 'Mail sent';
    } catch (Exception $e) {
        $mailStatus = 'failed';
        $response_text = $mail->ErrorInfo ?: 'Mail failed';
    }

    $log = $pdo->prepare("
        INSERT INTO email_logs(user_id,type,subject,status,response_text,created_at)
        VALUES(?,?,?,?,?,NOW())
    ");
    $log->execute([$userId,'donation','New Donation Request',$mailStatus,$response_text]);
}

/* Final response with data */
successResponse("Donation request submitted. Waiting for admin review.", [
    "donation_id" => $donation_id,
    "user_id"     => $userId,
    "description" => $description,
    "amount"      => $amount,
    "remaining_amount" => $amount, // included for consistency
    "status"      => "pending",
    "photos"      => $storedFiles,
    "location"    => $location,
    "created_at"  => date('Y-m-d H:i:s')
]);

<?php
// admin/activate_user.php
// Activate, deactivate, or delete a user account (only 'user' role).
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

// Only admin can perform actions
authorize(['admin']);

$input = json_decode(file_get_contents("php://input"), true);
if (empty($input['user_id']) || empty($input['action'])) {
    errorResponse("user_id and action required", 422);
}

$user_id = intval($input['user_id']);
$action = strtolower($input['action']); // activate, deactivate, delete
$valid_actions = ['activate','deactivate','delete'];

if (!in_array($action, $valid_actions)) {
    errorResponse("Invalid action. Allowed: activate, deactivate, delete", 422);
}

/* -------- CHECK USER EXISTS -------- */
$stmt = $pdo->prepare("SELECT id, name, email, role FROM users WHERE id=?");
$stmt->execute([$user_id]);
$u = $stmt->fetch();

if (!$u) {
    errorResponse("User not found", 404);
}

/* -------- CHECK ROLE -------- */
if ($u['role'] !== 'user') {
    errorResponse("Can only manage user accounts", 403);
}

/* -------- PERFORM ACTION -------- */
$status_map = [
    'activate'   => 'active',
    'deactivate' => 'inactive',
    'delete'     => 'deleted'
];

try {
    if ($action === 'delete') {
        $updateStmt = $pdo->prepare("UPDATE users SET status='deleted', deleted_at=NOW() WHERE id=?");
        $updateStmt->execute([$user_id]);
    } else {
        $updateStmt = $pdo->prepare("UPDATE users SET status=? WHERE id=?");
        $updateStmt->execute([$status_map[$action], $user_id]);
    }

    if ($updateStmt->rowCount() === 0) {
        errorResponse("Failed to update user status in DB. Check user_id or DB connection.", 500);
    }

} catch (Exception $e) {
    errorResponse("Database error: ".$e->getMessage(), 500);
}

/* -------- MAIL PART START -------- */
if (!empty($u['email'])) {
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

        $mail->setFrom("your_email@example.com", "Helping Hands Trust");
        $mail->addAddress($u['email'], $u['name']);
        $mail->isHTML(true);

        if ($action === 'activate') {
            $subject = "Your Account Has Been Activated";
            $message = "Your account has been activated successfully. You can now log in and use our services.";
        } elseif ($action === 'deactivate') {
            $subject = "Your Account Has Been Deactivated";
            $message = "Your account has been deactivated. Please contact support for more details.";
        } else { // delete
            $subject = "Your Account Has Been Deleted";
            $message = "Your account has been deleted by the admin. Please contact support for more details.";
        }

        $mail->Subject = $subject;
        $mail->Body = "
        <p>Dear {$u['name']},</p>
        <p>{$message}</p>
        <br>
        <p>Thank you.</p>
        <p>With regards,<br>Helping Hands Trust</p>
        ";

        $mail->send();
        $mailStatus = 'sent';
        $response_text = 'Mail sent successfully';

    } catch (Exception $e) {
        $mailStatus = 'failed';
        $response_text = $mail->ErrorInfo ?: $e->getMessage();
    }

    // Ensure response_text is never null
    $response_text = $response_text ?: ($mailStatus === 'sent' ? 'Mail sent successfully' : 'Mail failed to send');

    $log = $pdo->prepare("
        INSERT INTO email_logs(user_id,type,subject,status,response_text,created_at)
        VALUES(?,?,?,?,?,NOW())
    ");
    $log->execute([
        $user_id,
        'activation',
        $subject,
        $mailStatus,
        $response_text
    ]);
}
/* -------- MAIL PART END -------- */

successResponse("User action completed successfully", [
    "user_id" => $user_id,
    "action"  => $action,
    "status"  => $status_map[$action]
]);

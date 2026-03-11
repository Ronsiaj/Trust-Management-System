<?php
// auth/register.php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse("Use POST method", 405);
}

$input = json_decode(file_get_contents("php://input"), true);
if (!$input) {
    errorResponse("Invalid JSON body", 400);
}

/* Helper function to check required fields */
function req($data, $fields) {
    $miss = [];
    foreach ($fields as $f) {
        if (empty(trim($data[$f] ?? ''))) $miss[] = $f;
    }
    if ($miss) errorResponse("Missing fields: " . implode(", ", $miss), 422);
}

req($input, ['name','email','phone','password']);

$name = trim($input['name']);
$email = strtolower(trim($input['email']));
$phone = trim($input['phone']);
$password = $input['password'];
$role = 'user';

/* Validation */
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    errorResponse("Invalid email", 422);
}

if (!preg_match('/^[6-9]\d{9}$/', $phone)) {
    errorResponse("Invalid phone number", 422);
}

/* 🔒 PASSWORD STRENGTH VALIDATION (NEW) */
if (
    strlen($password) < 6 ||
    !preg_match('/[A-Z]/', $password) ||
    !preg_match('/[a-z]/', $password) ||
    !preg_match('/[0-9]/', $password) ||
    !preg_match('/[\W_]/', $password)
) {
    errorResponse(
        "Password must be at least 6 characters and include uppercase, lowercase, number, and special character",
        422
    );
}

/* Duplicate check */
$stmt = $pdo->prepare("SELECT id FROM users WHERE email=? OR phone=?");
$stmt->execute([$email,$phone]);
if ($stmt->fetch()) {
    errorResponse("Email or phone already exists", 409);
}

/* Hash password */
$hash = password_hash($password, PASSWORD_BCRYPT);

/* REGISTER = ACTIVE */
$status = 'active';

$stmt = $pdo->prepare("
    INSERT INTO users(name,email,phone,password,role,status,created_at)
    VALUES(?,?,?,?,?,?,NOW())
");
$stmt->execute([$name,$email,$phone,$hash,$role,$status]);

$user_id = $pdo->lastInsertId();

/* ========== USER MAIL ========== */
$q = $pdo->prepare("SELECT name, email FROM users WHERE id=?");
$q->execute([$user_id]);
$u = $q->fetch();

if ($u) {
    $mailStatus = 'failed';
    $response_text = 'Mail failed';

    try {
        $mail = new PHPMailer(true);
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
        $mail->Subject = "Your Account Registration";
        $mail->Body = "
            <p>Dear {$u['name']},</p>
            <p>Your account has been successfully created and is <strong>active</strong>.</p>
            <p>You can login and start using the system immediately.</p>
            <p>Regards,<br>Helping Hands Trust</p>
        ";
        $mail->send();
        $mailStatus = 'sent';
        $response_text = 'Mail sent successfully';
    } catch (Exception $e) {
        $response_text = $mail->ErrorInfo ?: 'Mail failed';
    }

    $log = $pdo->prepare("
        INSERT INTO email_logs(user_id,type,subject,status,response_text,created_at)
        VALUES(?,?,?,?,?,NOW())
    ");
    $log->execute([$user_id,'notification','Your Account Registration',$mailStatus,$response_text]);
}

/* ========== ADMIN MAIL ========== */
$qAdmins = $pdo->prepare("SELECT email, name FROM users WHERE role='admin' AND status='active'");
$qAdmins->execute();
$admins = $qAdmins->fetchAll();

foreach ($admins as $admin) {
    $mailStatus = 'failed';
    $response_text = 'Mail failed';

    try {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = "your_smtp_host";
        $mail->SMTPAuth   = true;
        $mail->Username   = "your_email@example.com";
        $mail->Password   = "your_email_password";
        $mail->SMTPSecure = "tls";
        $mail->Port       = 587;

        $mail->setFrom("your_email@example.com", "Helping Hand Trust");
        $mail->addAddress($admin['email'], $admin['name']);
        $mail->isHTML(true);
        $mail->Subject = "New User Registered";
        $mail->Body = "
            <p>A new user has registered in the system.</p>
            <p>Name: {$name}</p>
            <p>Email: {$email}</p>
            <p>Phone: {$phone}</p>
            <p>Status: Active</p>
        ";
        $mail->send();
        $mailStatus = 'sent';
        $response_text = 'Mail sent successfully';
    } catch (Exception $e) {
        $response_text = $mail->ErrorInfo ?: 'Mail failed';
    }

    $log = $pdo->prepare("
        INSERT INTO email_logs(user_id,type,subject,status,response_text,created_at)
        VALUES(?,?,?,?,?,NOW())
    ");
    $log->execute([$user_id,'notification','New User Registered',$mailStatus,$response_text]);
}

/* FINAL RESPONSE */
successResponse("Registration successful", [
    "user_id" => $user_id,
    "role"    => $role,
    "status"  => $status
], 201);

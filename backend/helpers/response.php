<?php
// helpers/response.php
// Standard JSON responses for APIs.

function successResponse($message = "Success", $data = [], $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

    // Ensure $data is always an array
    if ($data === null) $data = [];

    echo json_encode([
        "success" => true,
        "message" => $message,
        "data"    => $data
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

function errorResponse($message = "Error", $statusCode = 400, $data = []) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

    // Ensure $data is always an array
    if ($data === null) $data = [];

    echo json_encode([
        "success" => false,
        "message" => $message,
        "data"    => $data
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

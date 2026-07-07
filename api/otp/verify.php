<?php
/* POST /api/otp/verify.php   body: { phone, otp, token }
   Recomputes the HMAC from the entered code and returns { verified: bool }. */

require __DIR__ . '/../config.php';
require __DIR__ . '/../lib/otp.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'POST only']);
    exit;
}

$in    = read_json_body();
$phone = trim($in['phone'] ?? '');
$otp   = trim($in['otp'] ?? '');
$token = trim($in['token'] ?? '');

if ($phone === '' || $otp === '' || $token === '') {
    http_response_code(400);
    echo json_encode(['verified' => false, 'error' => 'missing fields']);
    exit;
}

$verified = otp_verify_token($phone, $otp, $token, $SECRETS['OTP_SECRET']);
echo json_encode(['verified' => $verified]);

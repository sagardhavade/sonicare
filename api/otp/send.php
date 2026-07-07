<?php
/* POST /api/otp/send.php   body: { phone, email, name }
   Generates a 6-digit code, emails it (and SMSes it if a gateway is set),
   and returns an opaque { token } the browser echoes back on verify. */

require __DIR__ . '/../config.php';
require __DIR__ . '/../lib/otp.php';
require __DIR__ . '/../lib/mailer.php';
require __DIR__ . '/../lib/sms.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'POST only']);
    exit;
}

$in    = read_json_body();
$phone = trim($in['phone'] ?? '');
$email = trim($in['email'] ?? '');
$name  = trim($in['name'] ?? '');

if ($phone === '' && $email === '') {
    http_response_code(400);
    echo json_encode(['error' => 'phone or email is required']);
    exit;
}

$code = otp_generate_code();

$sent = false;
if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL)) {
    if (send_otp_email($email, $name, $code, $SECRETS)) $sent = true;
}
if (send_otp_sms($phone, $code, $SECRETS)) $sent = true;

if (!$sent) {
    http_response_code(502);
    echo json_encode(['error' => 'Could not send the verification code. Please try again.']);
    exit;
}

// Identifier is the phone number (always present, unique per booking).
$token = otp_issue_token($phone, $code, $SECRETS['OTP_SECRET'], (int) ($SECRETS['OTP_TTL'] ?? 300));
echo json_encode(['ok' => true, 'token' => $token]);

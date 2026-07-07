<?php
/* Stateless OTP helpers.
   The code is delivered to the customer (email/SMS); the browser only ever
   holds an opaque HMAC token. Verification recomputes the HMAC from the
   user-entered code, so no database/session is needed. The server secret
   (OTP_SECRET) makes offline brute-forcing of the 6-digit code infeasible. */

function otp_generate_code() {
    return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
}

/* token = base64url( exp . "." . HMAC_SHA256(secret, identifier|code|exp) ) */
function otp_issue_token($identifier, $code, $secret, $ttlSeconds = 300) {
    $exp = time() + (int) $ttlSeconds;
    $payload = strtolower(trim($identifier)) . '|' . $code . '|' . $exp;
    $sig = hash_hmac('sha256', $payload, $secret);
    return rtrim(strtr(base64_encode($exp . '.' . $sig), '+/', '-_'), '=');
}

function otp_verify_token($identifier, $code, $token, $secret) {
    $raw = base64_decode(strtr($token, '-_', '+/'));
    if ($raw === false || strpos($raw, '.') === false) return false;
    list($expStr, $sig) = explode('.', $raw, 2);
    $exp = (int) $expStr;
    if ($exp <= 0 || time() > $exp) return false;               // expired
    $payload = strtolower(trim($identifier)) . '|' . $code . '|' . $exp;
    $expected = hash_hmac('sha256', $payload, $secret);
    return hash_equals($expected, $sig);
}

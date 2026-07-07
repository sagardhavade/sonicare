<?php
/* Pluggable SMS sender. Most Indian SMS gateways accept a simple HTTP GET.
   Put your gateway URL in secrets.php as SMS_API_URL with {phone} and {otp}
   placeholders, e.g.
     https://sms-provider.example/api?key=XXX&to={phone}&text=Your%20OTP%20is%20{otp}
   Leave SMS_API_URL empty to disable SMS (email-only for now). */

function send_otp_sms($phone, $code, $cfg) {
    if (empty($cfg['SMS_API_URL']) || $phone === '') return false;
    $url = str_replace(
        ['{phone}', '{otp}'],
        [rawurlencode($phone), rawurlencode($code)],
        $cfg['SMS_API_URL']
    );
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 10,
    ]);
    curl_exec($ch);
    $ok = curl_errno($ch) === 0 && (int) curl_getinfo($ch, CURLINFO_HTTP_CODE) < 400;
    curl_close($ch);
    return $ok;
}

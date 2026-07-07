<?php
/* Shared bootstrap for the OTP endpoints: loads secrets, sets JSON + CORS
   headers, handles preflight, and parses the JSON request body. */

header('Content-Type: application/json; charset=utf-8');

$secretsFile = __DIR__ . '/secrets.php';
if (!file_exists($secretsFile)) {
    http_response_code(500);
    echo json_encode(['error' => 'Server not configured: copy secrets.sample.php to secrets.php']);
    exit;
}
$SECRETS = require $secretsFile;

// CORS — set CORS_ORIGIN in secrets.php to your site origin in production.
$allowOrigin = isset($SECRETS['CORS_ORIGIN']) && $SECRETS['CORS_ORIGIN'] !== ''
    ? $SECRETS['CORS_ORIGIN'] : '*';
header('Access-Control-Allow-Origin: ' . $allowOrigin);
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

function read_json_body() {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (is_array($data)) return $data;
    return $_POST; // fallback for form-encoded posts
}

/* Apply CA-verification options to a cURL handle.
   Keeps SSL verification ON. If the server has no curl.cainfo configured
   (common on Windows/XAMPP), fall back to the CA bundle shipped in api/lib,
   so HTTPS calls to the CRM / Razorpay verify correctly everywhere.
   Refresh api/lib/cacert.pem periodically from https://curl.se/ca/cacert.pem */
function curl_apply_ca($ch) {
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
    if (ini_get('curl.cainfo') === '' || ini_get('curl.cainfo') === false) {
        $bundled = __DIR__ . '/lib/cacert.pem';
        if (is_readable($bundled)) curl_setopt($ch, CURLOPT_CAINFO, $bundled);
    }
}

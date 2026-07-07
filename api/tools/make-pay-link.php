<?php
/* ---------------------------------------------------------------------------
   Signed pay-link generator (CLI ONLY — never web-accessible).

   Builds a tamper-proof payment link for pay.html. The amount is signed with
   PAY_LINK_SECRET, so if anyone edits &amount= in the URL the server rejects it.

   Usage (from the project root, with PHP on PATH):
     php api/tools/make-pay-link.php <baseUrl> <booking> <amount> [name] [email] [phone]

   Example:
     php api/tools/make-pay-link.php https://soniccare.in SC-260707-1234 1499 "Ramesh" r@x.com 9999999999

   Notes:
   - <amount> must be whole rupees (integer, no decimals/leading zeros) so the
     signature round-trips through the browser's number parsing unchanged.
   - <baseUrl> is your site origin, e.g. http://localhost:8000 or https://soniccare.in
--------------------------------------------------------------------------- */

if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    exit('This tool is CLI-only.');
}

$SECRETS = require __DIR__ . '/../secrets.php';
$secret  = $SECRETS['PAY_LINK_SECRET'] ?? '';
if ($secret === '') {
    fwrite(STDERR, "PAY_LINK_SECRET is empty in secrets.php — links would be unsigned.\n");
    exit(1);
}

$args = $argv;
array_shift($args); // drop script name
if (count($args) < 3) {
    fwrite(STDERR, "Usage: php make-pay-link.php <baseUrl> <booking> <amount> [name] [email] [phone]\n");
    exit(1);
}

list($baseUrl, $booking, $amount) = $args;
$name  = $args[3] ?? '';
$email = $args[4] ?? '';
$phone = $args[5] ?? '';

// Canonicalise amount to a whole-rupee integer string (matches the browser round-trip).
if (!preg_match('/^\d+$/', $amount)) {
    fwrite(STDERR, "Amount must be whole rupees (integer), e.g. 1499. Got: $amount\n");
    exit(1);
}

// Signature covers exactly "booking|amount" — same string the backend re-computes.
$sig = hash_hmac('sha256', $booking . '|' . $amount, $secret);

$params = [
    'booking' => $booking,
    'amount'  => $amount,
    'name'    => $name,
    'email'   => $email,
    'phone'   => $phone,
    'sig'     => $sig,
];
// Drop empty optional fields for a cleaner link.
$params = array_filter($params, function ($v) { return $v !== ''; });

$query = http_build_query($params);
$link  = rtrim($baseUrl, '/') . '/pay.html?' . $query;

echo $link . "\n";

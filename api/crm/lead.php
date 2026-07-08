<?php
/* POST /api/crm/lead.php
   ---------------------------------------------------------------------------
   Receives a booking from the website (JSON), builds a signed Razorpay
   pay-link for the SELECTED SERVICE's price, embeds it in the CRM
   'requirement' field, then forwards the lead to the BizPlus CRM server-side.

   Doing this on the server means:
     • the pay-link is signed with PAY_LINK_SECRET (tamper-proof amount),
     • the price comes from the authoritative catalogue, not the browser,
     • the CRM user/pass never ship in client JavaScript,
     • we can read the CRM's real response (true success/failure).

   Returns: { success:true, bookingId, payLink } or { error }.
   --------------------------------------------------------------------------- */

require __DIR__ . '/../config.php';
$CATALOGUE = require __DIR__ . '/../lib/catalogue.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'POST only']);
    exit;
}

$in      = read_json_body();
$name    = trim($in['name']      ?? '');
$service = trim($in['service']   ?? '');
$date    = trim($in['date']      ?? '');
$time    = trim($in['time']      ?? '');
$email   = trim($in['email']     ?? '');
$phone   = trim($in['phone']     ?? '');
$address = trim($in['address']   ?? '');
$booking = trim($in['bookingId'] ?? '');

if ($name === '' || $phone === '' || $service === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

/* ---- Base requirement: service + preferred slot + booking id ---- */
$requirement = $service
    . ' | Preferred: ' . trim($date . ' ' . $time)
    . ' | Booking ' . $booking;

/* ---- Append a signed pay-link when the service has a fixed price ----
   The service value looks like "Switch Replacement (SC102)" — pull the code,
   look up the authoritative price, and sign booking|amount. */
$payLink = null;
$amount  = null;
if (preg_match('/\(([A-Z0-9]+)\)\s*$/', $service, $m) && isset($CATALOGUE[$m[1]])) {
    $amount = (int) $CATALOGUE[$m[1]];
}
if ($amount !== null && $amount > 0 && $booking !== '') {
    $params = [
        'booking' => $booking,
        'amount'  => (string) $amount,
        'name'    => $name,
        'email'   => $email,
        'phone'   => $phone,
    ];
    $secret = $SECRETS['PAY_LINK_SECRET'] ?? '';
    if ($secret !== '') {
        $params['sig'] = hash_hmac('sha256', $booking . '|' . $amount, $secret);
    }
    $payLink = crm_pay_base_url($SECRETS) . '/pay.html?' . http_build_query($params);
    // Two line breaks before the URL so it sits on its own line (easy copy-paste).
    $requirement .= ' | Pay ₹' . $amount . ": \n\n" . $payLink;
}

/* ---- Forward the lead to the BizPlus CRM (POST, params in the URL) ---- */
$crmUrl = $SECRETS['CRM_URL'] ?? '';
if ($crmUrl === '') {
    http_response_code(500);
    echo json_encode(['error' => 'CRM not configured']);
    exit;
}
$crmParams = [
    'user'        => $SECRETS['CRM_USER'] ?? '',
    'pass'        => $SECRETS['CRM_PASS'] ?? '',
    'name'        => $name,
    'requirement' => $requirement,
    'email'       => $email,
    'phone'       => $phone,
    'address'     => $address,
];
$url = $crmUrl . '?' . http_build_query($crmParams);

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => '',   // POST with an empty body → sends Content-Length: 0
    CURLOPT_TIMEOUT        => 20,
]);
curl_apply_ca($ch);
$res  = curl_exec($ch);
$code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
if ($res === false) { error_log('CRM push curl error: ' . curl_error($ch)); }
curl_close($ch);

if ($res === false || $code >= 400) {
    error_log('CRM push failed (' . $code . '): ' . $res);
    http_response_code(502);
    echo json_encode(['error' => 'Could not save the booking to CRM']);
    exit;
}

echo json_encode(['success' => true, 'bookingId' => $booking, 'payLink' => $payLink]);


/* Site origin for the pay-link. Override with PAY_BASE_URL in secrets.php;
   otherwise derive it from the incoming request (works in dev and prod). */
function crm_pay_base_url($SECRETS) {
    $override = $SECRETS['PAY_BASE_URL'] ?? '';
    if ($override !== '') return rtrim($override, '/');
    $https  = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['SERVER_PORT'] ?? '') == 443);
    $scheme = $https ? 'https' : 'http';
    $host   = $_SERVER['HTTP_HOST'] ?? 'localhost';
    return $scheme . '://' . $host;
}

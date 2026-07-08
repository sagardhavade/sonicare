<?php
/* POST /api/pay/order.php
   body: { amount, booking, name, email, phone, sig? }
   Creates a Razorpay order and returns the public bits the browser needs.
   The Key Secret never leaves the server. */

require __DIR__ . '/../config.php';
require __DIR__ . '/../lib/razorpay.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'POST only']);
    exit;
}

$in      = read_json_body();
$amount  = (float) ($in['amount'] ?? 0);      // rupees
$booking = trim($in['booking'] ?? '');
$name    = trim($in['name'] ?? '');
$email   = trim($in['email'] ?? '');
$phone   = trim($in['phone'] ?? '');
$sig     = trim($in['sig'] ?? '');

if ($amount <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid amount']);
    exit;
}

// Anti-tamper: if PAY_LINK_SECRET is configured, the link must be signed.
if (!rzp_verify_link($booking, (string) ($in['amount'] ?? ''), $sig, $SECRETS)) {
    http_response_code(403);
    echo json_encode(['error' => 'Invalid or unsigned payment link']);
    exit;
}

$amountPaise = (int) round($amount * 100);
$receipt     = $booking !== '' ? $booking : ('rcpt_' . time());
$order = rzp_create_order($amountPaise, $receipt, ['booking' => $booking, 'name' => $name, 'phone' => $phone], $SECRETS);

if (!$order || empty($order['id'])) {
    http_response_code(502);
    echo json_encode(['error' => 'Could not create payment order. Please try again.']);
    exit;
}

echo json_encode([
    'orderId'  => $order['id'],
    'keyId'    => $SECRETS['RAZORPAY_KEY_ID'],  // public key — safe for the browser
    'amount'   => $amountPaise,
    'currency' => 'INR',
    'booking'  => $booking,
    'name'     => $name,
    'email'    => $email,
    'phone'    => $phone,
]);

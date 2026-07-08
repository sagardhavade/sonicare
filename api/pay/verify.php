<?php
/* POST /api/pay/verify.php
   body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking? }
   Confirms the payment signature server-side → { verified: bool, paymentId }. */

require __DIR__ . '/../config.php';
require __DIR__ . '/../lib/razorpay.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'POST only']);
    exit;
}

$in        = read_json_body();
$orderId   = trim($in['razorpay_order_id'] ?? '');
$paymentId = trim($in['razorpay_payment_id'] ?? '');
$signature = trim($in['razorpay_signature'] ?? '');

$verified = rzp_verify_signature($orderId, $paymentId, $signature, $SECRETS);

if ($verified) {
    // ---- CRM HOOK (future) ----
    // Payment confirmed — mark the booking Paid / send receipt in the Trio CRM.
    // e.g. call the CRM API with booking id + payment id here.
}

echo json_encode(['verified' => $verified, 'paymentId' => $verified ? $paymentId : null]);

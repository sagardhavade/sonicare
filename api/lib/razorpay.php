<?php
/* Razorpay helpers — server-side only (uses the Key Secret).
   Docs: https://razorpay.com/docs/api/orders/ */

/* Create an order. $amountPaise is an integer amount in paise (₹1 = 100). */
function rzp_create_order($amountPaise, $receipt, $notes, $cfg) {
    $payload = json_encode([
        'amount'          => (int) $amountPaise,
        'currency'        => 'INR',
        'receipt'         => (string) $receipt,
        'payment_capture' => 1,
        'notes'           => is_array($notes) ? $notes : [],
    ]);

    $ch = curl_init('https://api.razorpay.com/v1/orders');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_USERPWD        => $cfg['RAZORPAY_KEY_ID'] . ':' . $cfg['RAZORPAY_KEY_SECRET'],
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_TIMEOUT        => 20,
    ]);
    $res  = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if ($res === false) { error_log('Razorpay order curl error: ' . curl_error($ch)); }
    curl_close($ch);

    if ($res === false || $code >= 400) {
        error_log('Razorpay order failed (' . $code . '): ' . $res);
        return null;
    }
    return json_decode($res, true);
}

/* Verify the signature Razorpay Checkout returns after a successful payment. */
function rzp_verify_signature($orderId, $paymentId, $signature, $cfg) {
    if ($orderId === '' || $paymentId === '' || $signature === '') return false;
    $expected = hash_hmac('sha256', $orderId . '|' . $paymentId, $cfg['RAZORPAY_KEY_SECRET']);
    return hash_equals($expected, $signature);
}

/* Optional: verify a signed pay-link so the amount can't be tampered with.
   The CRM builds the link with sig = HMAC_SHA256("booking|amount", PAY_LINK_SECRET).
   Returns true when signing is disabled (PAY_LINK_SECRET empty). */
function rzp_verify_link($booking, $amount, $sig, $cfg) {
    $secret = $cfg['PAY_LINK_SECRET'] ?? '';
    if ($secret === '') return true; // signing disabled (test/dev)
    $expected = hash_hmac('sha256', $booking . '|' . $amount, $secret);
    return hash_equals($expected, (string) $sig);
}

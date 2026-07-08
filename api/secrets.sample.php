<?php
/* Template for secrets.php.
   Copy this file to secrets.php and fill in real values.
   secrets.php is git-ignored — NEVER commit real credentials. */

return [
    // Gmail SMTP (use a Gmail App Password, NOT the account password)
    'SMTP_USER'      => 'tcpltechsp@gmail.com',
    'SMTP_PASS'      => 'your16charapppassword',   // no spaces
    'MAIL_FROM'      => 'tcpltechsp@gmail.com',
    'MAIL_FROM_NAME' => 'Sonic Care',
    // SMTP port: 587 = STARTTLS (default, works on most VPS); 465 = implicit SSL.
    // Many hosts block 465 — leave this at 587 unless you know 465 is open.
    'SMTP_PORT'      => 587,

    // Server-side secret for signing OTP tokens (long random string)
    'OTP_SECRET'     => 'replace-with-a-long-random-string',
    'OTP_TTL'        => 300,                        // code validity in seconds

    // Optional SMS gateway (leave '' to disable). {phone} and {otp} are replaced.
    'SMS_API_URL'    => '',

    // Razorpay — Key ID is used in the browser; Key Secret stays server-side only.
    'RAZORPAY_KEY_ID'     => 'rzp_test_xxxxxxxxxxxxxx',
    'RAZORPAY_KEY_SECRET' => 'your-razorpay-key-secret',
    'PAY_LINK_SECRET'     => '',   // set to require signed pay-links (anti-tamper)

    // Restrict to your site origin in production, e.g. 'https://soniccare.in'
    'CORS_ORIGIN'    => '*',
];

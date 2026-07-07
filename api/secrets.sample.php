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

    // Server-side secret for signing OTP tokens (long random string)
    'OTP_SECRET'     => 'replace-with-a-long-random-string',
    'OTP_TTL'        => 300,                        // code validity in seconds

    // Optional SMS gateway (leave '' to disable). {phone} and {otp} are replaced.
    'SMS_API_URL'    => '',

    // Restrict to your site origin in production, e.g. 'https://soniccare.in'
    'CORS_ORIGIN'    => '*',
];

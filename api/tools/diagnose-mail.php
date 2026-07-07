<?php
/* ---------------------------------------------------------------------------
   OTP / mail deployment diagnostic  (CLI ONLY — never web-accessible).

   Run on the VPS from the project root:
     php api/tools/diagnose-mail.php                 # checks config + port 465
     php api/tools/diagnose-mail.php you@example.com # also sends a REAL test email

   It never prints secret values — only whether things are present/reachable.
--------------------------------------------------------------------------- */

if (php_sapi_name() !== 'cli') { http_response_code(403); exit('CLI only.'); }

function line($label, $ok, $detail = '') {
    echo str_pad($label, 34) . ($ok ? 'OK  ✅' : 'FAIL ❌') . ($detail ? "  — $detail" : '') . "\n";
}

echo "== Sonic Care mail diagnostic ==\n\n";

/* 1) secrets.php present & loadable */
$secretsFile = __DIR__ . '/../secrets.php';
$hasSecrets = is_readable($secretsFile);
line('secrets.php present', $hasSecrets, $hasSecrets ? '' : 'copy secrets.sample.php → secrets.php on the VPS');
if (!$hasSecrets) { echo "\nStop: create api/secrets.php first.\n"; exit(1); }
$S = require $secretsFile;

/* 2) required SMTP keys filled */
foreach (['SMTP_USER', 'SMTP_PASS', 'MAIL_FROM'] as $k) {
    $v = trim((string)($S[$k] ?? ''));
    $placeholder = $v === '' || strpos($v, 'your16char') !== false || strpos($v, 'replace') !== false;
    line("secrets: $k set", !$placeholder, $placeholder ? 'still empty/placeholder' : '');
}

/* 3) openssl extension (needed for ssl:// socket) */
line('openssl extension', extension_loaded('openssl'), extension_loaded('openssl') ? '' : 'enable extension=openssl in php.ini');

/* 4) outbound TCP 465 to smtp.gmail.com */
$fp = @stream_socket_client('ssl://smtp.gmail.com:465', $errno, $errstr, 12);
$portOpen = (bool)$fp;
line('connect smtp.gmail.com:465', $portOpen, $portOpen ? '' : "$errstr ($errno) — provider likely blocks outbound SMTP; ask them to unblock or use port 587/API");
if ($portOpen) {
    stream_set_timeout($fp, 12);
    $banner = fgets($fp, 515);
    line('  SMTP banner (220)', substr($banner, 0, 3) === '220', trim($banner));
    @fwrite($fp, "QUIT\r\n"); fclose($fp);
}

/* 5) optional: full auth + send test */
$to = $argv[1] ?? '';
if ($to !== '') {
    echo "\n-- Sending a real test email to $to --\n";
    require __DIR__ . '/../lib/mailer.php';
    $ok = send_otp_email($to, 'Diagnostic', '123456', $S);
    line('send_otp_email()', $ok, $ok ? 'check the inbox (and spam)' : 'see the SMTP error in the server error log');
}

echo "\nDone.\n";

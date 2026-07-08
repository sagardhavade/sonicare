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

/* 4) outbound SMTP to smtp.gmail.com — test the configured port (default 587),
      forcing IPv4 (dead IPv6 routes cause "Network is unreachable"). */
$port = (int) ($S['SMTP_PORT'] ?? 587);
$proto = $port === 465 ? 'ssl' : 'tcp';
$ctx = stream_context_create(['socket' => ['bindto' => '0.0.0.0:0']]);
$fp = @stream_socket_client("$proto://smtp.gmail.com:$port", $errno, $errstr, 12, STREAM_CLIENT_CONNECT, $ctx);
$portOpen = (bool)$fp;
line("connect smtp.gmail.com:$port", $portOpen, $portOpen ? '' : "$errstr ($errno) — try SMTP_PORT 587 (or 465); if both fail the host blocks SMTP → use an HTTP email API");
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

<?php
/* Sends the OTP email via Gmail SMTP using ONLY PHP built-ins — no Composer,
   no PHPMailer.

   Uses port 587 + STARTTLS by default (many VPS hosts block the implicit-SSL
   port 465 but allow 587). Set SMTP_PORT=465 in secrets.php to use implicit
   SSL instead. The connection is forced over IPv4 because a lot of VPS boxes
   advertise an AAAA route they can't actually use → "Network is unreachable".

   Requires the openssl extension and outbound TCP to the chosen SMTP port.
   PHP's mail() is intentionally NOT used — it can't authenticate to Gmail. */

function send_otp_email($toEmail, $toName, $code, $cfg) {
    $host = $cfg['SMTP_HOST'] ?? 'smtp.gmail.com';
    $port = (int) ($cfg['SMTP_PORT'] ?? 587);
    $user = $cfg['SMTP_USER'];
    $pass = $cfg['SMTP_PASS'];
    $from = $cfg['MAIL_FROM'];
    $fromName = $cfg['MAIL_FROM_NAME'] ?? 'Sonic Care';
    $implicitSsl = ($port === 465);   // 465 = SSL from the start; 587 = STARTTLS

    // Verify the TLS cert against the bundled CA (works even if php.ini has no
    // openssl.cafile), and force IPv4 to avoid dead-IPv6 "unreachable" errors.
    $ssl = ['SNI_enabled' => true, 'peer_name' => $host,
            'verify_peer' => true, 'verify_peer_name' => true];
    $caFile = __DIR__ . '/cacert.pem';
    if (is_readable($caFile)) $ssl['cafile'] = $caFile;
    $ctx = stream_context_create(['socket' => ['bindto' => '0.0.0.0:0'], 'ssl' => $ssl]);

    $transport = ($implicitSsl ? 'ssl://' : 'tcp://') . $host . ':' . $port;
    $fp = @stream_socket_client($transport, $errno, $errstr, 15, STREAM_CLIENT_CONNECT, $ctx);
    if (!$fp) { error_log("SMTP connect failed ($transport): $errstr ($errno)"); return false; }
    stream_set_timeout($fp, 15);

    // Read a (possibly multi-line) reply and check its 3-digit code.
    $expect = function ($codes) use ($fp) {
        $data = '';
        while (($line = fgets($fp, 515)) !== false) {
            $data .= $line;
            if (isset($line[3]) && $line[3] === ' ') break;   // last line of reply
        }
        $got = (int) substr($data, 0, 3);
        return in_array($got, (array) $codes, true);
    };
    $cmd  = function ($line) use ($fp) { fwrite($fp, $line . "\r\n"); };
    $fail = function () use ($fp) { @fwrite($fp, "QUIT\r\n"); fclose($fp); return false; };

    if (!$expect(220)) return $fail();
    $cmd('EHLO soniccare'); if (!$expect(250)) return $fail();

    // Upgrade a plain 587 connection to TLS before authenticating.
    if (!$implicitSsl) {
        $cmd('STARTTLS'); if (!$expect(220)) return $fail();
        $crypto = STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT;
        if (defined('STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT')) $crypto |= STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT;
        if (!stream_socket_enable_crypto($fp, true, $crypto)) {
            error_log('SMTP STARTTLS negotiation failed'); return $fail();
        }
        $cmd('EHLO soniccare'); if (!$expect(250)) return $fail();
    }

    $cmd('AUTH LOGIN');                if (!$expect(334)) return $fail();
    $cmd(base64_encode($user));        if (!$expect(334)) return $fail();
    $cmd(base64_encode($pass));        if (!$expect(235)) return $fail();  // auth OK
    $cmd('MAIL FROM:<' . $from . '>'); if (!$expect(250)) return $fail();
    $cmd('RCPT TO:<' . $toEmail . '>');if (!$expect([250, 251])) return $fail();
    $cmd('DATA');                      if (!$expect(354)) return $fail();

    $html =
        '<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">'
        . '<h2 style="color:#0b5fb0;margin:0 0 8px">Sonic Care</h2>'
        . '<p>Your verification code is:</p>'
        . '<p style="font-size:30px;font-weight:800;letter-spacing:8px;color:#11203a;margin:8px 0">' . $code . '</p>'
        . '<p style="color:#667">This code expires in 5 minutes. If you did not request it, please ignore this email.</p>'
        . '</div>';

    $headers  = 'From: "' . $fromName . '" <' . $from . '>' . "\r\n";
    $headers .= 'To: <' . $toEmail . '>' . "\r\n";
    $headers .= 'Subject: Your Sonic Care verification code' . "\r\n";
    $headers .= 'MIME-Version: 1.0' . "\r\n";
    $headers .= 'Content-Type: text/html; charset=UTF-8' . "\r\n";
    $headers .= 'Content-Transfer-Encoding: 8bit' . "\r\n";

    // Normalise newlines to CRLF and dot-stuff lines beginning with "."
    $message = $headers . "\r\n" . $html . "\r\n";
    $message = preg_replace('~\R~u', "\r\n", $message);
    $message = str_replace("\r\n.", "\r\n..", $message);

    fwrite($fp, $message . "\r\n.\r\n");
    $ok = $expect(250);                // message accepted for delivery

    $cmd('QUIT');
    fclose($fp);

    if (!$ok) error_log('SMTP send: message not accepted for ' . $toEmail);
    return $ok;
}

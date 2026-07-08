<?php
/* Sends the OTP email via Gmail SMTP using ONLY PHP built-ins — no Composer,
   no PHPMailer. It opens an SSL socket to smtp.gmail.com:465 and authenticates
   with the Gmail App Password from secrets.php.

   Note: PHP's mail() is intentionally NOT used — it cannot authenticate to
   Gmail, so the app password would be ignored and messages would usually be
   rejected (SPF/DKIM) or land in spam. Requires the openssl extension and
   outbound TCP port 465 open on the server. */

function send_otp_email($toEmail, $toName, $code, $cfg) {
    $host = 'smtp.gmail.com';
    $port = 465;                       // implicit SSL
    $user = $cfg['SMTP_USER'];
    $pass = $cfg['SMTP_PASS'];
    $from = $cfg['MAIL_FROM'];
    $fromName = $cfg['MAIL_FROM_NAME'] ?? 'Sonic Care';

    $fp = @stream_socket_client("ssl://{$host}:{$port}", $errno, $errstr, 15);
    if (!$fp) { error_log("SMTP connect failed: $errstr ($errno)"); return false; }
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
    $cmd = function ($line) use ($fp) { fwrite($fp, $line . "\r\n"); };

    $fail = function () use ($fp) {
        @fwrite($fp, "QUIT\r\n"); fclose($fp); return false;
    };

    if (!$expect(220)) return $fail();
    $cmd('EHLO soniccare');            if (!$expect(250)) return $fail();
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

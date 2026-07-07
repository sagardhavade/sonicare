<?php
/* Sends the OTP email via Gmail SMTP using PHPMailer.
   Run `composer require phpmailer/phpmailer` in the project root so that
   vendor/autoload.php exists. Credentials come from secrets.php (git-ignored). */

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

function send_otp_email($toEmail, $toName, $code, $cfg) {
    $autoload = __DIR__ . '/../../vendor/autoload.php';
    if (!file_exists($autoload)) {
        error_log('OTP mail error: vendor/autoload.php missing — run composer require phpmailer/phpmailer');
        return false;
    }
    require_once $autoload;

    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = $cfg['SMTP_USER'];
        $mail->Password   = $cfg['SMTP_PASS'];
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;   // implicit TLS
        $mail->Port       = 465;

        $mail->setFrom($cfg['MAIL_FROM'], $cfg['MAIL_FROM_NAME']);
        $mail->addAddress($toEmail, $toName !== '' ? $toName : $toEmail);

        $mail->Subject = 'Your Sonic Care verification code';
        $mail->isHTML(true);
        $mail->Body =
            '<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">'
            . '<h2 style="color:#0b5fb0;margin:0 0 8px">Sonic Care</h2>'
            . '<p>Your verification code is:</p>'
            . '<p style="font-size:30px;font-weight:800;letter-spacing:8px;color:#11203a;margin:8px 0">' . $code . '</p>'
            . '<p style="color:#667">This code expires in 5 minutes. If you did not request it, please ignore this email.</p>'
            . '</div>';
        $mail->AltBody = 'Your Sonic Care verification code is ' . $code . '. It expires in 5 minutes.';

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log('OTP mail error: ' . $mail->ErrorInfo);
        return false;
    }
}

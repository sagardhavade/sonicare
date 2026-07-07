# Sonic Care — Setup

Static site (`index.html`, `css/`, `js/`) + a small **PHP OTP backend** in `api/`
that emails a verification code via Gmail SMTP before a booking is confirmed.

## 1. Install the mailer dependency (PHPMailer)

From the project root, on your VPS (or locally):

```bash
composer install        # reads composer.json → creates vendor/
```

If you don't have Composer: https://getcomposer.org/download/ (or `dnf install composer` / `yum install composer` on CentOS).

## 2. Configure secrets

`api/secrets.php` holds the real credentials and is **git-ignored** (never committed).
It already contains the Gmail account and a generated `OTP_SECRET`. To recreate it elsewhere:

```bash
cp api/secrets.sample.php api/secrets.php
# then edit api/secrets.php
```

Fields:
- `SMTP_USER` / `SMTP_PASS` — Gmail address + **App Password** (16 chars, no spaces)
- `OTP_SECRET` — long random string (used to sign OTP tokens)
- `OTP_TTL` — code validity in seconds (default 300 = 5 min)
- `SMS_API_URL` — optional SMS gateway URL with `{phone}` / `{otp}` placeholders
- `CORS_ORIGIN` — set to your site origin in production (e.g. `https://soniccare.in`)

> 🔐 The Gmail App Password was shared in plaintext — **generate a new one and revoke the old** at
> Google Account → Security → App passwords, then update `secrets.php`.

## 3. Run locally

PHP's built-in server serves both the static site and the API on one origin:

```bash
php -S localhost:8000
# open http://localhost:8000
```

Booking flow: fill the form → if an **email** is entered, a code is emailed →
enter it → Booking ID is generated → lead is pushed to the Trio CRM.
(No email entered → OTP is skipped for now; SMS OTP can be added later via `SMS_API_URL`.)

## 4. Deploy on the CentOS VPS

- Serve the project root with Apache or Nginx + PHP-FPM.
- Ensure `/api/otp/send.php` and `/api/otp/verify.php` are reachable at the same
  origin as the site (so no CORS needed). If the API is on a different host, set
  `CORS_ORIGIN` in `secrets.php`.
- Upload `vendor/` (or run `composer install` on the server).
- Keep `api/secrets.php` on the server only — it is not in git.
- Gmail SMTP uses port **465** (SMTPS) — make sure outbound 465 is open.

## 5. Toggle / demo mode

In `js/config.js`:
- `otp.enabled: false` — skip OTP entirely.
- `otp.sendUrl`/`verifyUrl: ""` — client-side **demo** OTP (code shown on screen; no backend).

## Configuration lives in one place

`js/config.js` — CRM API, OTP endpoints, WhatsApp/phone/email, map, service areas, GST/CIN.

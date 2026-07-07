# Sonic Care — Setup

Static site (`index.html`, `css/`, `js/`) + a small **PHP OTP backend** in `api/`
that emails a verification code via Gmail SMTP before a booking is confirmed.

## 1. Requirements (no Composer, no libraries)

Everything uses PHP built-ins:
- **Email** — sent over Gmail SMTP via PHP sockets (`api/lib/mailer.php`). Needs the
  **openssl** extension and **outbound TCP port 465** open on the server.
- **Razorpay** — plain cURL (`ext-curl`).
- **OTP tokens** — `hash_hmac` (built-in).

No `composer install` and no `vendor/` directory are needed.

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
- Keep `api/secrets.php` on the server only — it is not in git.
- Gmail SMTP uses port **465** (SMTPS) — make sure outbound 465 is open.

## 5. Razorpay invoice payments (`pay.html`)

After a job, the CRM sends the customer a link:

```
https://your-site/pay.html?booking=SC-260707-1234&amount=1499&name=Rahul&email=r@x.com&phone=8380045525
```

`pay.html` → `api/pay/order.php` (creates the Razorpay order) → Razorpay Checkout →
`api/pay/verify.php` (verifies the signature server-side). The **Key Secret never
reaches the browser**; the Key ID is returned by `order.php`.

- Keys live in `secrets.php` (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`). Current keys are **test** (`rzp_test_…`).
- Go live: replace with your live keys (`rzp_live_…`) in `secrets.php`.
- **Amount tamper protection (recommended):** the amount sits in the URL, so a user
  could edit it. Set `PAY_LINK_SECRET` in `secrets.php` and have the CRM append a
  signature so `order.php` rejects tampered links:
  `sig = HMAC_SHA256("<booking>|<amount>", PAY_LINK_SECRET)` → add `&sig=<sig>` to the link.
  Best practice is for the CRM (which holds the real invoice amount) to build these links.
- `checkout.razorpay.com` must be reachable (it's loaded on `pay.html`).

## 6. Toggle / demo mode

In `js/config.js`:
- `otp.enabled: false` — skip OTP entirely.
- `otp.sendUrl`/`verifyUrl: ""` — client-side **demo** OTP (code shown on screen; no backend).

## Configuration lives in one place

`js/config.js` — CRM API, OTP endpoints, WhatsApp/phone/email, map, service areas, GST/CIN.

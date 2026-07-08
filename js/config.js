/* =============================================================
   Sonic Care — Site Configuration
   Single source of truth for endpoints, contact details & map.
   Edit values here; no other file needs to change.
   ============================================================= */

const CONFIG = {
  // Booking backend. Leave empty ("") to run in front-end demo mode.
  // When BizPlus ERP is ready, set this to the bookings API URL.
  // The form POSTs FormData here and expects a JSON response.
  bookingEndpoint: "",

  // ---- CRM lead API (via our PHP backend) ----
  // The booking is POSTed to this backend endpoint, which signs the Razorpay
  // pay-link with the selected service's price, embeds it in the CRM
  // "requirement" field, and forwards the lead to the BizPlus CRM server-side.
  // The CRM url/user/pass now live in api/secrets.php (CRM_URL/CRM_USER/CRM_PASS),
  // NOT here — keeping credentials out of client JavaScript.
  // Set enabled:false to skip the CRM call (demo mode / local testing).
  // Requires the site to be served by PHP (same server as /api/otp/).
  crm: {
    enabled: true,
    leadUrl: "/api/crm/lead.php",
  },

  // ---- OTP verification (frozen journey: OTP BEFORE Booking ID) ----
  // Handled by the PHP backend in /api/otp/ (emails the code via Gmail SMTP).
  // OTP is triggered only when the customer provides an email (see main.js).
  // Endpoints are relative, so the site must be served by the PHP server
  //   • local dev:  php -S localhost:8000   (then open http://localhost:8000)
  //   • production: your VPS serving these files + PHP
  // Set both to "" to fall back to a client-side DEMO OTP (code shown on screen).
  otp: {
    enabled: true,
    sendUrl: "/api/otp/send.php",     // POST { phone, email, name } -> { token }
    verifyUrl: "/api/otp/verify.php", // POST { phone, otp, token }  -> { verified }
    resendSeconds: 30,
  },

  // ---- Razorpay invoice payments (pay.html) ----
  // The CRM sends customers a link like:
  //   pay.html?booking=SC-260707-1234&amount=1499&name=...&email=...&phone=...
  // The Razorpay Key ID comes from the server (order.php); the Key Secret
  // stays server-side only. Only these public settings live here.
  pay: {
    orderUrl: "/api/pay/order.php",   // POST { amount, booking, ... } -> { orderId, keyId, ... }
    verifyUrl: "/api/pay/verify.php", // POST { razorpay_* }           -> { verified }
    businessName: "Sonic Care",
    themeColor: "#0b5fb0",
  },

  // Contact details
  whatsappNumber: "919921388999", // international format, no "+" or spaces
  phone: "+919021244333",
  email: "info@sonicgroup.co.in",

  // Prefilled WhatsApp message (URL-encoded automatically in main.js)
  whatsappMessage: "Hi Sonic Care, I'd like to book a service.",

  // Google Maps embed src — centered on Narayan Peth, Pune.
  // Replace with a custom "Embed a map" src from Google Maps if needed.
  mapEmbedSrc:
    "https://www.google.com/maps?q=Narayan+Peth,+Pune,+Maharashtra+411030&output=embed",

  // Business info (shown in footer)
  address: "Dhruta Complex, 104 & 105, NC Kelkar Road, Narayan Peth, Pune 411030",
  hours: "Mon–Sat, 10 AM – 7 PM · 24/7 Emergency Support",
  coverage: "10–15 km radius from Narayan Peth, Pune",

  // Optional second contact number (leave "" to hide)
  phone2: "",

  // ---- Legal / business details (CLIENT: replace placeholders below) ----
  // Any field left empty ("") is automatically hidden in the footer.
  gst: "27AAQPW8611H1Z2",   // GSTIN
  cin: "",                                          // CIN / legal entity name, if applicable (empty = hidden)
  // Google Business / reviews link — used by the Reviews section & review request.
  googleReviewUrl: "https://www.google.com/maps?q=Sonic+Distributors,+Narayan+Peth,+Pune",

  // Areas currently served (shown as chips in the Service Area section)
  areas: [
    "Narayan Peth",
    "Sadashiv Peth",
    "Deccan",
    "Erandwane",
    "Shivajinagar",
    "Navi Peth",
    "Karve Nagar",
    "Kothrud (selected areas)",
    "Swargate",
    "Camp (selected areas)",
  ],
};

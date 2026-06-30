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

  // Contact details
  whatsappNumber: "919021244333", // international format, no "+" or spaces
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

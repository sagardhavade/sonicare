/* =============================================================
   Sonic Care — Landing Page Behavior
   Form validation + booking, content injection, FAQ, nav, reveal.
   Depends on CONFIG (js/config.js, loaded first).
   ============================================================= */
(function () {
  "use strict";

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Inline SVG icon set (keeps HTML lean) ---------- */
  var ICONS = {
    home: '<path d="M3 11 12 3l9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9Z"/>',
    building: '<path d="M3 21V5a1 1 0 0 1 1-1h7v17H3Zm10 0V9h7a1 1 0 0 1 1 1v11h-8ZM6 7h2v2H6V7Zm0 4h2v2H6v-2Zm0 4h2v2H6v-2Z"/>',
    battery: '<path d="M4 8h14a2 2 0 0 1 2 2v1h2v2h-2v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2Zm3 2-2 3h3l-1 3 4-4H8l1-2H7Z"/>',
    bolt: '<path d="M13 2 4.5 13.5H11l-1 8.5 8.5-12H12l1-8Z"/>',
    sun: '<path d="M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12Zm0-5 2 3h-4l2-3Zm0 19 2 3h-4l2-3ZM1 12l3-2v4l-3-2Zm22 0-3 2v-4l3 2ZM4 4l3 1-1 3-2-4Zm16 16-3-1 1-3 2 4ZM4 20l2-4 1 3-3 1ZM20 4l-2 4-1-3 3-1Z"/>',
    shield: '<path d="M12 2 4 5v6c0 5 3.4 9 8 11 4.6-2 8-6 8-11V5l-8-3Zm-1 14-4-4 1.4-1.4L11 13.2l4.6-4.6L17 10l-6 6Z"/>',
    wrench: '<path d="M22 6.7a5 5 0 0 1-6.6 6L6 21.4 2.6 18l9.3-9.3A5 5 0 0 1 18.3 2L15 5.3l1.6 2.1L18.7 9 22 6.7Z"/>',
    alert: '<path d="M12 2 1 21h22L12 2Zm0 14h2v2h-2v-2Zm0-7h2v5h-2V9Z"/>',
    check: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.2 14.4-4-4L8.2 11l2.6 2.6L15.4 9l1.4 1.4-6 6Z"/>',
    rupee: '<path d="M6 4h12v2h-3.2c.5.6.8 1.3.9 2H18v2h-2.3c-.4 2.3-2.3 4-4.7 4H10l5 6h-2.6L7 14v-2h2.5c1.3 0 2.4-.8 2.8-2H6V8h6.3c-.4-1.2-1.5-2-2.8-2H6V4Z"/>',
    star: '<path d="m12 2 3 6.3 7 .9-5 4.7 1.3 6.8L12 17.6 5.7 20.7 7 13.9 2 9.2l7-.9L12 2Z"/>',
    invoice: '<path d="M6 2h9l5 5v15H6V2Zm8 1.5V8h4.5L14 3.5ZM8 11h8v2H8v-2Zm0 4h8v2H8v-2Z"/>',
    clock: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 10V6h-2v7l5 3 1-1.7-4-2.3Z"/>',
    card: '<path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm-1 4h20v2H2V9Zm3 5h6v2H5v-2Z"/>',
    coins: '<path d="M12 2c-4.4 0-8 1.57-8 3.5S7.6 9 12 9s8-1.57 8-3.5S16.4 2 12 2Zm-8 5.5v3C4 12.43 7.6 14 12 14s8-1.57 8-3.5v-3C20 9.43 16.4 11 12 11S4 9.43 4 7.5Zm0 5v3C4 17.43 7.6 19 12 19s8-1.57 8-3.5v-3C20 14.43 16.4 16 12 16s-8-1.57-8-3.5Z"/>',
    lock: '<path d="M6 10V8a6 6 0 0 1 12 0v2h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h1Zm2 0h8V8a4 4 0 0 0-8 0v2Zm4 4a1.5 1.5 0 0 0-1 2.6V18h2v-1.4a1.5 1.5 0 0 0-1-2.6Z"/>',
    company: '<path d="M3 21V8l7-4 7 4v3h4v10h-7v-5h-2v5H3Zm7-9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/>',
    medal: '<path d="M8 2h8l-2 6h-4L8 2Zm4 7a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm0 2.6L10.9 14l-2.4.2 1.8 1.6-.5 2.4 2.2-1.2 2.2 1.2-.5-2.4 1.8-1.6-2.4-.2L12 11.6Z"/>',
    chat: '<path d="M4 3h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H8l-4 4V4a1 1 0 0 1 1-1Zm3 5v2h10V8H7Zm0 4v2h7v-2H7Z"/>',
    sms: '<path d="M3 4h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H7l-4 4V5a1 1 0 0 1 1-1Zm4 5v2h10V9H7Zm0 4v2h6v-2H7Z"/>',
    user: '<path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5 0-9 2.5-9 6v2h18v-2c0-3.5-4-6-9-6Z"/>',
    pin: '<path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"/>',
    bulb: '<path d="M12 2a7 7 0 0 0-4.2 12.6c.5.4.8 1 .9 1.6l.1.8h6.4l.1-.8c.1-.6.4-1.2.9-1.6A7 7 0 0 0 12 2Zm-3 15h6v1a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-1Z"/>',
    plug: '<path d="M9 2v6H7v3a5 5 0 0 0 4 4.9V22h2v-6.1A5 5 0 0 0 17 11V8h-2V2h-2v6h-2V2H9Z"/>'
  };
  function svg(name) {
    return '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + (ICONS[name] || ICONS.bolt) + '</svg>';
  }

  /* ---------- Content data ---------- */
  // 8 frozen homepage categories (customers pick a category, then a service).
  var SERVICES = [
    { icon: "wrench", title: "Electrical Repairs", desc: "Switches, sockets, MCB, fuse, regulators, doorbells & fault diagnosis." },
    { icon: "bulb", title: "Lighting & Fans", desc: "LED, tube, ceiling & outdoor lights; ceiling, exhaust & wall fans." },
    { icon: "bolt", title: "UPS & Inverters", desc: "UPS installation, health checks & inverter wiring." },
    { icon: "battery", title: "Batteries", desc: "Battery replacement & health checks for inverters and UPS." },
    { icon: "plug", title: "New Wiring & Power Points", desc: "New power, light, fan, TV & router/LAN points." },
    { icon: "shield", title: "Electrical Safety Inspection", desc: "Safety audits, earthing, load analysis & DB inspection." },
    { icon: "building", title: "Office & Clinic Maintenance", desc: "Commercial visits & maintenance for offices and clinics." },
    { icon: "clock", title: "Annual Maintenance (AMC)", desc: "Annual maintenance contracts with priority service." }
  ];

  // "Why Trust Sonic?" — real, verifiable facts (no invented metrics).
  var WHY = [
    { icon: "company", title: "Powered by Sonic Distributors", desc: "Backed by an established Pune-based power-solutions company." },
    { icon: "medal", title: "Experienced Company", desc: "Years of expertise in electrical & power-backup solutions." },
    { icon: "invoice", title: "GST Registered Business", desc: "A registered, compliant business you can trust." },
    { icon: "shield", title: "Verified Technicians", desc: "Background-checked, trained & ID-verified professionals." },
    { icon: "invoice", title: "Digital Invoicing", desc: "Instant, itemised invoices delivered digitally on every job." },
    { icon: "coins", title: "Secure Online Payments", desc: "Pay safely via UPI, cards or net-banking." },
    { icon: "check", title: "OTP-Based Job Completion", desc: "Work is marked complete only after your OTP confirmation." }
  ];

  // Trust strip below the hero (quick reassurance badges).
  var TRUST_STRIP = [
    { icon: "shield", label: "Verified Technicians" },
    { icon: "rupee", label: "Transparent Pricing" },
    { icon: "invoice", label: "Digital Invoice" },
    { icon: "coins", label: "Online Payments" },
    { icon: "medal", label: "Service Warranty" },
    { icon: "clock", label: "Same-Day Service" }
  ];

  // Post-booking journey shown in the success state.
  var BOOKING_JOURNEY = [
    { icon: "chat", label: "WhatsApp confirmation" },
    { icon: "sms", label: "SMS confirmation" },
    { icon: "user", label: "Technician assignment" },
    { icon: "check", label: "OTP verification on completion" },
    { icon: "invoice", label: "Digital invoice" },
    { icon: "card", label: "Secure payment link" },
    { icon: "star", label: "Google review request" }
  ];

  // Frozen Service Catalogue V1.0 — fixed labour prices (material extra).
  var CATALOGUE = [
    { cat: "Electrical Repairs", icon: "wrench", items: [
      { code: "SC101", name: "Fault Diagnosis / Visit", price: "₹299" },
      { code: "SC102", name: "Switch Replacement", price: "₹149" },
      { code: "SC103", name: "Socket Replacement", price: "₹199" },
      { code: "SC104", name: "Modular Switch / Socket", price: "₹249" },
      { code: "SC105", name: "Door Bell Installation", price: "₹299" },
      { code: "SC106", name: "MCB Replacement", price: "₹399" },
      { code: "SC107", name: "Fuse Replacement", price: "₹199" },
      { code: "SC108", name: "Regulator Replacement", price: "₹249" }
    ]},
    { cat: "Lighting & Fans", icon: "bulb", items: [
      { code: "SC201", name: "LED Bulb Installation", price: "₹99" },
      { code: "SC202", name: "Tube Light Installation", price: "₹199" },
      { code: "SC203", name: "Ceiling Light Installation", price: "₹299" },
      { code: "SC204", name: "Chandelier Installation", price: "₹799+" },
      { code: "SC205", name: "Outdoor Light Installation", price: "₹399" },
      { code: "SC301", name: "Ceiling Fan Installation", price: "₹399" },
      { code: "SC302", name: "Ceiling Fan Replacement", price: "₹449" },
      { code: "SC303", name: "Exhaust Fan Installation", price: "₹399" },
      { code: "SC304", name: "Wall Fan Installation", price: "₹349" }
    ]},
    { cat: "UPS & Inverters", icon: "bolt", items: [
      { code: "SC401", name: "UPS Installation", price: "₹999" },
      { code: "SC403", name: "UPS Health Check", price: "₹499" },
      { code: "SC405", name: "Inverter Wiring Check", price: "₹499" }
    ]},
    { cat: "Batteries", icon: "battery", items: [
      { code: "SC402", name: "Battery Replacement", price: "₹399" },
      { code: "SC404", name: "Battery Health Check", price: "₹399" }
    ]},
    { cat: "New Wiring & Power Points", icon: "plug", items: [
      { code: "SC501", name: "New Power Point", price: "₹699" },
      { code: "SC502", name: "New Light Point", price: "₹599" },
      { code: "SC503", name: "New Fan Point", price: "₹699" },
      { code: "SC504", name: "TV Point", price: "₹699" },
      { code: "SC505", name: "Router / LAN Power Point", price: "₹699" }
    ]},
    { cat: "Electrical Safety Inspection", icon: "shield", items: [
      { code: "SC601", name: "Electrical Safety Inspection", price: "₹999" },
      { code: "SC602", name: "Earthing Inspection", price: "₹799" },
      { code: "SC603", name: "Load Analysis", price: "₹999" },
      { code: "SC604", name: "Distribution Board Inspection", price: "₹799" }
    ]},
    { cat: "Office & Clinic Maintenance", icon: "building", items: [
      { code: "SC701", name: "Office Electrical Visit", price: "₹499" },
      { code: "SC702", name: "Office Electrical Maintenance", price: "Quotation" },
      { code: "SC703", name: "Clinic Maintenance", price: "Quotation" }
    ]},
    { cat: "Annual Maintenance (AMC)", icon: "clock", items: [
      { code: "SC704", name: "AMC Inspection Visit", price: "₹499" },
      { code: "AMC", name: "Custom AMC Plan", price: "Quotation" }
    ]}
  ];

  // Premium / project work — quotation based (Section H).
  var PREMIUM = [
    "Complete House Wiring", "Office Wiring", "Solar Installation",
    "CCTV Installation", "EV Charger Installation (Future)",
    "Generator Wiring", "Electrical Renovation"
  ];

  // SAMPLE reviews — replace with genuine customer/Google reviews when available.
  var REVIEWS = [
    { name: "Priya Deshpande", area: "Kothrud", rating: 5, text: "Electrician arrived on time and fixed our wiring issue quickly. Clean work, transparent pricing and a digital invoice — very professional." },
    { name: "Amit Joshi", area: "Shivajinagar", rating: 5, text: "Got our office UPS serviced. Organised team, OTP confirmation on completion and easy online payment. Highly recommend." },
    { name: "Sneha Kulkarni", area: "Narayan Peth", rating: 5, text: "Booked an emergency service at night. Quick response and the technician was polite and skilled. Truly a doorstep service." },
    { name: "Rahul Patil", area: "Deccan", rating: 5, text: "Inverter battery replaced the same day with a genuine product. Fair price and proper warranty. Will use again." },
    { name: "Meera Sathe", area: "Erandwane", rating: 5, text: "Loved the booking experience — got a Booking ID instantly and WhatsApp updates throughout. Felt very organised." },
    { name: "Vikram Shah", area: "Camp", rating: 4, text: "Good safety inspection of our shop's wiring. Detailed report and clear recommendations. Slight delay but kept me informed." },
    { name: "Anjali Rao", area: "Navi Peth", rating: 5, text: "Verified technician, neat work and a proper digital bill. Exactly what a modern service should feel like." },
    { name: "Sagar More", area: "Karve Nagar", rating: 5, text: "Solar enquiry handled patiently with honest guidance. No pushy sales — just clear, useful advice." },
    { name: "Pooja Gokhale", area: "Sadashiv Peth", rating: 5, text: "AMC for our building's electrical work has been smooth. Reliable, responsive and reasonably priced." },
    { name: "Nikhil Bhosale", area: "Swargate", rating: 5, text: "Fan and switchboard repairs done well. Technician was courteous and cleaned up after the work. Great experience." }
  ];

  var FAQS = [
    { q: "How quickly can I get an electrician?", a: "For areas near Narayan Peth we often offer same-day slots. Emergency requests get priority and the fastest possible response." },
    { q: "Which areas do you serve?", a: "We currently cover a 10–15 km radius from Narayan Peth, Pune, across most major residential and commercial localities." },
    { q: "How is pricing decided?", a: "We share fixed starting prices upfront. After inspection you get a clear quote. Material charges are extra where applicable." },
    { q: "Are your technicians verified?", a: "Yes. Every technician is background-checked, trained and ID-verified before being assigned to a job." },
    { q: "How do I confirm the work is complete?", a: "Jobs are marked complete only after you share an OTP, ensuring the service met your satisfaction." },
    { q: "Do you provide a warranty?", a: "Yes, we offer a service warranty on workmanship. Warranty terms vary by service type and are mentioned on your invoice." },
    { q: "What payment methods are accepted?", a: "We accept UPI, debit/credit cards, net-banking and cash. You'll receive a digital invoice for every job." },
    { q: "Do you handle solar installations?", a: "Yes, we provide residential and commercial solar installation along with ongoing maintenance." },
    { q: "Can I reschedule my booking?", a: "Absolutely. Just reply on WhatsApp or call us, and we'll adjust your slot to a convenient time." },
    { q: "Do you offer Annual Maintenance Contracts (AMC)?", a: "Yes. Our AMC plans cover periodic inspections and priority service for homes and businesses." },
    { q: "Is there an emergency service charge?", a: "Emergency / after-hours visits may carry a priority charge, which we'll always tell you before confirming." },
    { q: "How do I get a copy of my invoice?", a: "A digital invoice is sent automatically after job completion. You can also request a copy on WhatsApp anytime." }
  ];

  /* ---------- Render helpers ---------- */
  function renderServices() {
    var html = SERVICES.map(function (s) {
      return '<div class="card service-tile reveal"><div class="icon-badge">' + svg(s.icon) +
        '</div><h3>' + s.title + '</h3><p>' + s.desc + '</p></div>';
    }).join("");
    var el = $("#serviceGrid"); if (el) el.innerHTML = html;
  }
  function renderWhy() {
    var html = WHY.map(function (w) {
      return '<div class="card reveal"><div class="icon-badge">' + svg(w.icon) +
        '</div><h3>' + w.title + '</h3><p>' + w.desc + '</p></div>';
    }).join("");
    var el = $("#whyGrid"); if (el) el.innerHTML = html;
  }
  function renderPricing() {
    var el = $("#pricingGrid");
    if (el) {
      el.innerHTML = CATALOGUE.map(function (c) {
        var rows = c.items.map(function (it) {
          return '<li><span>' + it.name + '</span><b>' + it.price + '</b></li>';
        }).join("");
        return '<div class="card price-cat reveal">' +
          '<div class="price-cat__head"><span class="icon-badge">' + svg(c.icon) + '</span><h3>' + c.cat + '</h3></div>' +
          '<ul class="price-list">' + rows + '</ul>' +
          '<a href="#book" class="btn btn--ghost btn--block">Book a service</a></div>';
      }).join("");
    }
    var pb = $("#premiumBox");
    if (pb) {
      pb.innerHTML = '<div class="card premium-box reveal">' +
        '<div class="price-cat__head"><span class="icon-badge">' + svg("company") + '</span>' +
        '<h3>Premium &amp; Project Work <small>· Quotation based</small></h3></div>' +
        '<ul class="premium-list">' +
        PREMIUM.map(function (p) { return '<li>' + svg("check") + '<span>' + p + '</span></li>'; }).join("") +
        '</ul><a href="#book" class="btn btn--brand">Request a Quotation</a></div>';
    }
  }
  // Populate the booking dropdown from the catalogue (category → exact service).
  function renderServiceOptions() {
    var sel = $("#service"); if (!sel) return;
    var html = '<option value="">Select a service…</option>';
    CATALOGUE.forEach(function (c) {
      html += '<optgroup label="' + c.cat + '">';
      c.items.forEach(function (it) {
        var suffix = it.price === "Quotation" ? " — Quotation" : " — " + it.price;
        html += '<option value="' + it.name + ' (' + it.code + ')" data-price="' + it.price + '">' + it.name + suffix + '</option>';
      });
      html += '</optgroup>';
    });
    html += '<optgroup label="Premium (Quotation)">';
    PREMIUM.forEach(function (p) { html += '<option value="' + p + ' (Quotation)" data-price="Quotation">' + p + '</option>'; });
    html += '</optgroup>';
    sel.innerHTML = html;
    // Keep the WhatsApp deep-links in sync with the chosen service + price.
    sel.addEventListener("change", updateWaLinks);
  }
  function renderTrustStrip() {
    var el = $("#trustStrip"); if (!el) return;
    el.innerHTML = TRUST_STRIP.map(function (t) {
      return '<li>' + svg(t.icon) + '<span>' + t.label + '</span></li>';
    }).join("");
  }
  function renderAreas() {
    var el = $("#areaChips"); if (!el || !CONFIG.areas) return;
    el.innerHTML = CONFIG.areas.map(function (a) {
      return '<li>' + svg("pin") + '<span>' + a + '</span></li>';
    }).join("");
  }
  function renderJourney() {
    var el = $("#journeyList"); if (!el) return;
    el.innerHTML = BOOKING_JOURNEY.map(function (j) {
      return '<li>' + svg(j.icon) + '<span>' + j.label + '</span></li>';
    }).join("");
  }
  function renderReviews() {
    var el = $("#reviewGrid"); if (!el) return;
    el.innerHTML = REVIEWS.map(function (r) {
      var rating = Math.max(1, Math.min(5, r.rating || 5));
      var stars = "★★★★★".slice(0, rating) + "☆☆☆☆☆".slice(0, 5 - rating);
      var initial = (r.name || "?").charAt(0).toUpperCase();
      return '<div class="card review reveal">' +
        '<div class="stars" aria-label="' + rating + ' out of 5 stars">' + stars + '</div>' +
        '<p>“' + r.text + '”</p>' +
        '<div class="review__author"><span class="avatar">' + initial + '</span>' +
        '<span><b>' + r.name + '</b><span>' + r.area + ', Pune</span></span></div></div>';
    }).join("");
  }
  function renderFaq() {
    var html = FAQS.map(function (f) {
      return '<div class="faq-item"><button class="faq-q" aria-expanded="false">' +
        '<span>' + f.q + '</span>' +
        '<svg class="chev" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m6 9 6 6 6-6 1.5 1.4L12 18.4 4.5 10.4 6 9Z"/></svg>' +
        '</button><div class="faq-a"><p>' + f.a + '</p></div></div>';
    }).join("");
    var el = $("#faqList"); if (el) el.innerHTML = html;
  }

  /* ---------- Config-driven links / text ---------- */
  function waLink() {
    var msg = CONFIG.whatsappMessage;
    // If the customer has picked a service in the booking form, include the
    // exact service name + price in the WhatsApp message.
    var sel = $("#service");
    if (sel && sel.value) {
      var opt = sel.options[sel.selectedIndex];
      var price = opt ? opt.getAttribute("data-price") : "";
      msg += "\n\nService: " + sel.value;
      if (price) msg += "\nPrice: " + price;
    }
    return "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(msg);
  }
  // (Re)apply the current WhatsApp deep-link to every [data-wa] button.
  function updateWaLinks() {
    $$("[data-wa]").forEach(function (a) {
      a.setAttribute("href", waLink());
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
    });
  }
  // Set text on an element, or hide its <li> wrapper when value is empty.
  function setOrHide(id, value, prefix) {
    var span = $("#" + id); if (!span) return;
    if (value && String(value).trim()) {
      span.textContent = (prefix || "") + value;
    } else {
      var li = span.closest("li") || span; li.style.display = "none";
    }
  }
  function applyConfig() {
    updateWaLinks();
    $$("[data-call]").forEach(function (a) { a.setAttribute("href", "tel:" + CONFIG.phone); });

    // Footer "Get In Touch" email link
    var fe = $("#footerEmail"); if (fe) { fe.setAttribute("href", "mailto:" + CONFIG.email); fe.textContent = "Email"; }

    // Footer contact + business details (empty fields auto-hide)
    setOrHide("footerAddress", CONFIG.address);
    var phones = [CONFIG.phone, CONFIG.phone2].filter(function (p) { return p && String(p).trim(); }).join(" · ");
    setOrHide("footerPhone", phones);
    setOrHide("footerEmailText", CONFIG.email);
    setOrHide("footerHours", CONFIG.hours);
    setOrHide("footerGst", CONFIG.gst, "GSTIN: ");
    setOrHide("footerCin", CONFIG.cin, "CIN: ");

    // Reviews CTA → Google
    var rb = $("#reviewBtn"); if (rb && CONFIG.googleReviewUrl) rb.setAttribute("href", CONFIG.googleReviewUrl);

    var ct = $("#coverageText"); if (ct) ct.textContent = "Current coverage: " + CONFIG.coverage + ".";
    var map = $("#mapFrame"); if (map) map.setAttribute("src", CONFIG.mapEmbedSrc);
    var yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();
  }

  /* ---------- Mobile nav ---------- */
  function initNav() {
    var toggle = $("#menuToggle"), nav = $("#mobileNav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$("a", nav).forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- FAQ accordion (event delegation) ---------- */
  function initFaq() {
    var list = $("#faqList");
    if (!list) return;
    list.addEventListener("click", function (e) {
      var btn = e.target.closest(".faq-q");
      if (!btn) return;
      var item = btn.parentElement;
      var ans = $(".faq-a", item);
      var isOpen = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      ans.style.maxHeight = isOpen ? ans.scrollHeight + "px" : null;
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    var els = $$(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Booking form ---------- */
  function genBookingId() {
    var d = new Date();
    var ymd = String(d.getFullYear()).slice(2) +
      ("0" + (d.getMonth() + 1)).slice(-2) +
      ("0" + d.getDate()).slice(-2);
    var rand = ("0000" + Math.floor(Math.random() * 10000)).slice(-4);
    return "SC-" + ymd + "-" + rand;
  }

  function validate(form) {
    var ok = true;
    var rules = {
      name: function (v) { return v.trim().length >= 2; },
      mobile: function (v) { return /^[6-9]\d{9}$/.test(v.trim()); },
      // Email is optional — valid only if left blank OR a proper address.
      email: function (v) { return v.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); },
      service: function (v) { return v !== ""; },
      date: function (v) { return v !== ""; },
      time: function (v) { return v !== ""; },
      address: function (v) { return v.trim().length >= 5; }
    };
    Object.keys(rules).forEach(function (id) {
      var input = form.elements[id];
      if (!input) return;
      var field = input.closest(".field");
      if (rules[id](input.value)) { field.classList.remove("invalid"); }
      else { field.classList.add("invalid"); ok = false; }
    });
    return ok;
  }

  function initForm() {
    var form = $("#bookingForm");
    if (!form) return;

    var state = { phone: "", email: "", name: "", code: "", token: "", bookingId: "" };
    var resendTimer = null;

    // min date = today, and prefill today's date by default
    var dateInput = form.elements["date"];
    if (dateInput) {
      var t = new Date();
      var today = t.getFullYear() + "-" + ("0" + (t.getMonth() + 1)).slice(-2) + "-" + ("0" + t.getDate()).slice(-2);
      dateInput.min = today;
      if (!dateInput.value) dateInput.value = today;
    }

    // clear error styling as the user fixes a field
    form.addEventListener("input", function (e) {
      var field = e.target.closest(".field");
      if (field) field.classList.remove("invalid");
    });

    function setSubmit(disabled, label) {
      var btn = $("#submitBtn");
      if (!btn) return;
      btn.disabled = disabled;
      btn.textContent = label || "Confirm Booking";
    }

    /* ----- OTP helpers ----- */
    var otpEnabled = !!(CONFIG.otp && CONFIG.otp.enabled);
    var otpMock = !(CONFIG.otp && CONFIG.otp.sendUrl && CONFIG.otp.verifyUrl);

    function captureContact() {
      state.phone = form.elements["mobile"].value.trim();
      state.email = form.elements["email"] ? form.elements["email"].value.trim() : "";
      state.name = form.elements["name"].value.trim();
    }
    function sendOtp() {
      captureContact();
      if (otpMock) { // demo: generate a code locally (NOT secure — real code lives server-side)
        state.code = String(Math.floor(100000 + Math.random() * 900000));
        return Promise.resolve();
      }
      return fetch(CONFIG.otp.sendUrl, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: state.phone, email: state.email, name: state.name })
      }).then(function (r) {
        if (!r.ok) throw new Error("otp send failed");
        return r.json();
      }).then(function (d) { state.token = (d && d.token) || ""; });
    }
    function verifyOtp(code) {
      if (otpMock) return Promise.resolve(code === state.code);
      return fetch(CONFIG.otp.verifyUrl, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: state.phone, otp: code, token: state.token })
      }).then(function (r) {
        if (!r.ok) return false;
        return r.json().then(function (d) { return !!(d && (d.verified || d.success)); }).catch(function () { return false; });
      });
    }

    function startResendTimer() {
      var secs = (CONFIG.otp && CONFIG.otp.resendSeconds) || 30;
      var resend = $("#otpResend"), timer = $("#otpTimer");
      stopResendTimer();
      if (resend) { resend.style.pointerEvents = "none"; resend.style.opacity = ".5"; }
      if (timer) timer.textContent = "(" + secs + "s)";
      resendTimer = setInterval(function () {
        secs--;
        if (timer) timer.textContent = secs > 0 ? "(" + secs + "s)" : "";
        if (secs <= 0) { stopResendTimer(); if (resend) { resend.style.pointerEvents = ""; resend.style.opacity = ""; } }
      }, 1000);
    }
    function stopResendTimer() { if (resendTimer) { clearInterval(resendTimer); resendTimer = null; } }

    function showDemoHint() {
      var demo = $("#otpDemo");
      if (!demo) return;
      if (otpMock) { demo.hidden = false; demo.textContent = "Demo mode — your code is " + state.code; }
      else { demo.hidden = true; }
    }
    function showOtpPanel() {
      var panel = $("#otpPanel");
      form.style.display = "none";
      panel.classList.add("show");
      // Code is delivered by email; show the destination address.
      var ph = $("#otpPhone"); if (ph) ph.textContent = state.email || ("+91 " + state.phone);
      var code = $("#otpCode"); if (code) code.value = "";
      var err = $("#otpError"); if (err) err.style.display = "none";
      showDemoHint();
      panel.scrollIntoView({ behavior: "smooth", block: "center" });
      if (code) setTimeout(function () { code.focus(); }, 60);
      startResendTimer();
    }
    function backToForm() {
      var panel = $("#otpPanel"); if (panel) panel.classList.remove("show");
      form.style.display = "";
      stopResendTimer();
      setSubmit(false, "Confirm Booking");
    }

    /* ----- Booking finalisation: generate Booking ID + push lead to CRM ----- */
    function finalizeBooking() {
      var f = form.elements;
      var bookingId = genBookingId();
      state.bookingId = bookingId;

      function showSuccess() {
        form.style.display = "none";
        var panel = $("#otpPanel"); if (panel) panel.classList.remove("show");
        var box = $("#formSuccess");
        $("#bookingId").textContent = bookingId;
        box.classList.add("show");
        box.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      function fail() {
        alert("Sorry, we couldn't save your booking right now. Please call us or reach out on WhatsApp.");
        backToForm();
      }

      // Push the lead through our PHP backend, which signs the pay-link with the
      // selected service's price and forwards it to the BizPlus CRM server-side.
      // Same-origin request → we can read the real success/failure response.
      if (CONFIG.crm && CONFIG.crm.enabled && CONFIG.crm.leadUrl) {
        var payload = {
          name: f["name"].value.trim(),
          service: f["service"].value,
          date: f["date"].value,
          time: f["time"].value,
          email: f["email"] ? f["email"].value.trim() : "",
          phone: f["mobile"].value.trim(),
          address: f["address"].value.trim(),
          bookingId: bookingId
          // Note: the optional photo cannot be sent via this API.
        };
        fetch(CONFIG.crm.leadUrl, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
          .then(function (res) { if (!res.ok) throw new Error("Request failed"); return res.json(); })
          .then(function (d) { if (d && d.success) showSuccess(); else fail(); })
          .catch(fail);
      } else if (CONFIG.bookingEndpoint) {
        var data = new FormData(form);
        data.append("bookingId", bookingId);
        fetch(CONFIG.bookingEndpoint, { method: "POST", body: data })
          .then(function (res) { if (!res.ok) throw new Error("Request failed"); showSuccess(); })
          .catch(fail);
      } else {
        showSuccess(); // demo mode
      }
    }

    /* ----- Events ----- */
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(form)) {
        var firstBad = $(".field.invalid input, .field.invalid select, .field.invalid textarea", form);
        if (firstBad) firstBad.focus();
        return;
      }
      // Frozen journey: OTP verification BEFORE Booking ID is generated.
      // OTP is delivered by email, so only run it when the customer gave one.
      // (SMS OTP for mobile can be enabled later via the backend's SMS gateway.)
      var email = form.elements["email"] ? form.elements["email"].value.trim() : "";
      if (!otpEnabled || !email) { setSubmit(true, "Submitting…"); finalizeBooking(); return; }
      setSubmit(true, "Sending OTP…");
      sendOtp().then(function () {
        setSubmit(false, "Confirm Booking");
        showOtpPanel();
      }).catch(function () {
        setSubmit(false, "Confirm Booking");
        alert("Couldn't send the verification code. Please check your email address or try again.");
      });
    });

    var verifyBtn = $("#otpVerifyBtn");
    if (verifyBtn) verifyBtn.addEventListener("click", function () {
      var codeInput = $("#otpCode"), err = $("#otpError");
      var code = (codeInput.value || "").trim();
      if (!/^\d{6}$/.test(code)) { err.textContent = "Enter the 6-digit code."; err.style.display = "block"; codeInput.focus(); return; }
      verifyBtn.disabled = true; verifyBtn.textContent = "Verifying…";
      verifyOtp(code).then(function (okv) {
        verifyBtn.disabled = false; verifyBtn.textContent = "Verify & Confirm Booking";
        if (okv) { stopResendTimer(); finalizeBooking(); }
        else { err.textContent = "Incorrect or expired code. Please try again."; err.style.display = "block"; codeInput.focus(); }
      }).catch(function () {
        verifyBtn.disabled = false; verifyBtn.textContent = "Verify & Confirm Booking";
        err.textContent = "Verification failed. Please try again."; err.style.display = "block";
      });
    });

    var backBtn = $("#otpBack");
    if (backBtn) backBtn.addEventListener("click", backToForm);

    var resendLink = $("#otpResend");
    if (resendLink) resendLink.addEventListener("click", function (e) {
      e.preventDefault();
      if (resendTimer) return; // still in cooldown
      sendOtp().then(function () { showDemoHint(); startResendTimer(); });
    });

    var otpInput = $("#otpCode");
    if (otpInput) otpInput.addEventListener("input", function () {
      this.value = this.value.replace(/\D/g, "").slice(0, 6);
      var err = $("#otpError"); if (err) err.style.display = "none";
    });
  }

  /* ---------- Booking modal ----------
     The single booking form lives inline (no-JS fallback). "Book" buttons
     relocate that form into the modal so there's only ever one form/IDs. */
  function initBookingModal() {
    var modal = $("#bookingModal");
    var card = $("#bookingFormCard");
    var home = $("#bookingHome");
    var body = $("#modalBody");
    if (!modal || !card || !home || !body) return;
    var lastFocus = null;

    function openModal(e) {
      if (e) e.preventDefault();
      lastFocus = document.activeElement;
      body.appendChild(card);                 // move form into modal
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      var first = $("#name"); if (first) setTimeout(function () { first.focus(); }, 60);
    }
    function closeModal() {
      home.appendChild(card);                  // return form to its inline home
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    // Any link to #book or [data-book] opens the modal instead of scrolling.
    document.addEventListener("click", function (e) {
      var trigger = e.target.closest('a[href="#book"], [data-book]');
      if (trigger) { openModal(e); return; }
      if (e.target.closest("[data-close-modal]")) closeModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
    });
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    renderTrustStrip();
    renderServices();
    renderWhy();
    renderPricing();
    renderServiceOptions();
    renderAreas();
    renderJourney();
    renderReviews();
    renderFaq();
    applyConfig();
    initNav();
    initFaq();
    initForm();
    initBookingModal();
    initReveal();
  });
})();

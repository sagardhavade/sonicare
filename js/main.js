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
    card: '<path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm-1 4h20v2H2V9Zm3 5h6v2H5v-2Z"/>'
  };
  function svg(name) {
    return '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + (ICONS[name] || ICONS.bolt) + '</svg>';
  }

  /* ---------- Content data ---------- */
  var SERVICES = [
    { icon: "home", title: "Residential", desc: "Wiring, repairs, fittings & safe home electrical work." },
    { icon: "building", title: "Commercial", desc: "Offices, shops & industrial electrical solutions." },
    { icon: "battery", title: "UPS & Inverter", desc: "Sales, install & repair of UPS and inverters." },
    { icon: "bolt", title: "Battery Replacement", desc: "Genuine batteries for inverters & UPS systems." },
    { icon: "sun", title: "Solar Services", desc: "Residential & commercial solar install + maintenance." },
    { icon: "shield", title: "Safety Inspection", desc: "Full electrical safety audits & load checks." },
    { icon: "wrench", title: "AMC", desc: "Annual maintenance contracts for peace of mind." },
    { icon: "alert", title: "Emergency Services", desc: "Rapid response for urgent electrical faults." }
  ];

  var WHY = [
    { icon: "shield", title: "Verified Technicians", desc: "Background-checked, trained & ID-verified professionals." },
    { icon: "rupee", title: "Transparent Pricing", desc: "Clear starting prices with no hidden charges." },
    { icon: "invoice", title: "Digital Invoice", desc: "Instant, itemised invoices delivered digitally." },
    { icon: "check", title: "OTP Verified Completion", desc: "Job marked done only after your OTP confirmation." },
    { icon: "clock", title: "Same-Day Service", desc: "Fast slots, often same-day for nearby areas." },
    { icon: "card", title: "Online Payments", desc: "Pay securely via UPI, cards or net-banking." }
  ];

  var PRICING = [
    { title: "Home Visit & Diagnosis", price: "₹199", unit: "/ visit", points: ["On-site inspection", "Expert assessment", "Adjusted in final bill"] },
    { title: "Switch / Socket Repair", price: "₹149", unit: "starting", points: ["Per point", "Genuine components", "Service warranty"] },
    { title: "Inverter / UPS Service", price: "₹499", unit: "starting", points: ["Full diagnostics", "Battery health check", "Performance tuning"] }
  ];

  var REVIEWS = [
    { name: "Priya Deshpande", area: "Kothrud, Pune", text: "Electrician arrived the same day and fixed our wiring issue quickly. Clean work and fair pricing!", rating: 5 },
    { name: "Amit Joshi", area: "Shivaji Nagar", text: "Got our office UPS serviced. Professional team, digital invoice and OTP confirmation — very organised.", rating: 5 },
    { name: "Sneha Kulkarni", area: "Narayan Peth", text: "Booked an emergency service at night. Quick response and the technician was polite and skilled.", rating: 5 }
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
    var html = PRICING.map(function (p) {
      var pts = p.points.map(function (pt) {
        return '<li>' + svg("check") + '<span>' + pt + '</span></li>';
      }).join("");
      return '<div class="card price-card reveal"><h3>' + p.title + '</h3>' +
        '<div class="price">' + p.price + ' <small>' + p.unit + '</small></div>' +
        '<ul>' + pts + '</ul>' +
        '<a href="#book" class="btn btn--brand btn--block">Book Now</a></div>';
    }).join("");
    var el = $("#pricingGrid"); if (el) el.innerHTML = html;
  }
  function renderReviews() {
    var html = REVIEWS.map(function (r) {
      var stars = "★★★★★".slice(0, r.rating);
      var initial = r.name.charAt(0);
      return '<div class="card review reveal"><div class="stars">' + stars + '</div>' +
        '<p>“' + r.text + '”</p>' +
        '<div class="review__author"><span class="avatar">' + initial + '</span>' +
        '<span><b>' + r.name + '</b><span>' + r.area + '</span></span></div></div>';
    }).join("");
    var el = $("#reviewGrid"); if (el) el.innerHTML = html;
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
    return "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(CONFIG.whatsappMessage);
  }
  function applyConfig() {
    $$("[data-wa]").forEach(function (a) { a.setAttribute("href", waLink()); a.setAttribute("target", "_blank"); a.setAttribute("rel", "noopener"); });
    $$("[data-call]").forEach(function (a) { a.setAttribute("href", "tel:" + CONFIG.phone); });
    var fe = $("#footerEmail"); if (fe) { fe.setAttribute("href", "mailto:" + CONFIG.email); fe.textContent = "Email"; }
    var fa = $("#footerAddress"); if (fa) fa.textContent = CONFIG.address;
    var fh = $("#footerHours"); if (fh) fh.textContent = CONFIG.hours;
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

    // min date = today
    var dateInput = form.elements["date"];
    if (dateInput) {
      var t = new Date();
      dateInput.min = t.getFullYear() + "-" + ("0" + (t.getMonth() + 1)).slice(-2) + "-" + ("0" + t.getDate()).slice(-2);
    }

    // clear error styling as the user fixes a field
    form.addEventListener("input", function (e) {
      var field = e.target.closest(".field");
      if (field) field.classList.remove("invalid");
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(form)) {
        var firstBad = $(".field.invalid input, .field.invalid select, .field.invalid textarea", form);
        if (firstBad) firstBad.focus();
        return;
      }

      var btn = $("#submitBtn");
      btn.disabled = true;
      btn.textContent = "Submitting…";

      var bookingId = genBookingId();
      var data = new FormData(form);
      data.append("bookingId", bookingId);

      function showSuccess() {
        form.style.display = "none";
        var box = $("#formSuccess");
        $("#bookingId").textContent = bookingId;
        box.classList.add("show");
        box.scrollIntoView({ behavior: "smooth", block: "center" });
        // ---- BACKEND HOOK (future) ----
        // On a real submission the server would: create a lead in BizPlus ERP,
        // send WhatsApp + SMS confirmation, and trigger OTP-verified workflow.
      }

      if (CONFIG.bookingEndpoint) {
        fetch(CONFIG.bookingEndpoint, { method: "POST", body: data })
          .then(function (res) {
            if (!res.ok) throw new Error("Request failed");
            showSuccess();
          })
          .catch(function () {
            btn.disabled = false;
            btn.textContent = "Confirm Booking";
            alert("Sorry, we couldn't submit your booking right now. Please call us or try again.");
          });
      } else {
        // Demo mode: no backend configured.
        showSuccess();
      }
    });
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    renderServices();
    renderWhy();
    renderPricing();
    renderReviews();
    renderFaq();
    applyConfig();
    initNav();
    initFaq();
    initForm();
    initReveal();
  });
})();

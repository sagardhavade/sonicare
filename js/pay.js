/* =============================================================
   Sonic Care — Invoice payment page (pay.html)
   Reads booking/amount from the URL, creates a Razorpay order via the
   PHP backend, opens Razorpay Checkout, and verifies the result server-side.
   The Key Secret never touches the browser.
   ============================================================= */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };

  var PAY = (window.CONFIG && CONFIG.pay) || {
    orderUrl: "/api/pay/order.php",
    verifyUrl: "/api/pay/verify.php",
    businessName: "Sonic Care",
    themeColor: "#0b5fb0",
  };

  var q = new URLSearchParams(location.search);
  var data = {
    booking: q.get("booking") || "",
    amount: parseFloat(q.get("amount") || "0"),
    name: q.get("name") || "",
    email: q.get("email") || "",
    phone: q.get("phone") || "",
    sig: q.get("sig") || "",
  };

  function inr(rupees) {
    return "₹" + Number(rupees).toLocaleString("en-IN");
  }
  function show(id) { var el = $(id); if (el) el.hidden = false; }
  function hide(id) { var el = $(id); if (el) el.hidden = true; }
  function status(msg) { var el = $("payStatus"); if (el) el.textContent = msg || ""; }

  document.addEventListener("DOMContentLoaded", function () {
    if (!data.amount || data.amount <= 0) { show("payInvalid"); return; }

    // Populate the pay screen
    $("payAmount").textContent = inr(data.amount);
    $("payBooking").textContent = data.booking || "—";
    if (data.name) { $("payName").textContent = data.name; }
    else { hide("payNameRow"); }
    show("payMain");

    if (typeof Razorpay === "undefined") {
      status("Payment library couldn't load. Check your connection and refresh.");
      $("payBtn").disabled = true;
      return;
    }

    $("payBtn").addEventListener("click", startPayment);
  });

  function startPayment() {
    var btn = $("payBtn");
    btn.disabled = true; btn.textContent = "Starting…"; status("");

    fetch(PAY.orderUrl, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (!res.ok || !res.j.orderId) {
          throw new Error(res.j && res.j.error ? res.j.error : "Could not start payment");
        }
        openCheckout(res.j);
      })
      .catch(function (err) {
        btn.disabled = false; btn.textContent = "Pay Securely";
        status(err.message || "Something went wrong. Please try again.");
      });
  }

  function openCheckout(order) {
    var btn = $("payBtn");
    var rzp = new Razorpay({
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amount,
      currency: order.currency,
      name: PAY.businessName || "Sonic Care",
      description: order.booking ? ("Invoice " + order.booking) : "Service payment",
      prefill: { name: order.name || "", email: order.email || "", contact: order.phone || "" },
      theme: { color: PAY.themeColor || "#0b5fb0" },
      handler: function (resp) { verifyPayment(resp, order); },
      modal: {
        ondismiss: function () {
          btn.disabled = false; btn.textContent = "Pay Securely";
          status("Payment cancelled. You can try again.");
        }
      }
    });
    rzp.on("payment.failed", function (resp) {
      btn.disabled = false; btn.textContent = "Pay Securely";
      status((resp && resp.error && resp.error.description) || "Payment failed. Please try again.");
    });
    rzp.open();
  }

  function verifyPayment(resp, order) {
    status("Confirming payment…");
    fetch(PAY.verifyUrl, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razorpay_order_id: resp.razorpay_order_id,
        razorpay_payment_id: resp.razorpay_payment_id,
        razorpay_signature: resp.razorpay_signature,
        booking: order.booking
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (v) {
        if (v && v.verified) {
          hide("payMain");
          $("paidAmount").textContent = inr(order.amount / 100);
          $("paidId").textContent = v.paymentId || resp.razorpay_payment_id;
          show("paySuccess");
        } else {
          status("We couldn't verify the payment. If money was deducted, contact us with your payment ID: " + resp.razorpay_payment_id);
          $("payBtn").disabled = false; $("payBtn").textContent = "Pay Securely";
        }
      })
      .catch(function () {
        status("Verification failed. Please contact us with payment ID: " + resp.razorpay_payment_id);
      });
  }
})();

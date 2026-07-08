<?php
/* Server-side price map (whole rupees) used to sign pay-links.
   ---------------------------------------------------------------------------
   KEEP IN SYNC with the CATALOGUE array in js/main.js.
   Only FIXED-price services are listed. Items priced "Quotation" or "₹799+"
   are intentionally omitted — they get no auto pay-link (the coordinator
   quotes them manually). The price here is authoritative: the browser never
   decides the amount, so a customer can't tamper the price before it's signed.
   --------------------------------------------------------------------------- */
return [
    // Electrical Repairs
    'SC101' => 299, 'SC102' => 149, 'SC103' => 199, 'SC104' => 249,
    'SC105' => 299, 'SC106' => 399, 'SC107' => 199, 'SC108' => 249,
    // Lighting & Fans  (SC204 "₹799+" → base price; coordinator collects any extra)
    'SC201' => 99,  'SC202' => 199, 'SC203' => 299, 'SC204' => 799, 'SC205' => 399,
    'SC301' => 399, 'SC302' => 449, 'SC303' => 399, 'SC304' => 349,
    // UPS & Inverters
    'SC401' => 999, 'SC403' => 499, 'SC405' => 499,
    // Batteries
    'SC402' => 399, 'SC404' => 399,
    // New Wiring & Power Points
    'SC501' => 699, 'SC502' => 599, 'SC503' => 699, 'SC504' => 699, 'SC505' => 699,
    // Electrical Safety Inspection
    'SC601' => 999, 'SC602' => 799, 'SC603' => 999, 'SC604' => 799,
    // Office & Clinic / AMC  (SC702, SC703, AMC are Quotation → omitted)
    'SC701' => 499, 'SC704' => 499,
];

# Rutina-mea
<!doctype html>
<html lang="ro">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Rutina Mea</title>

  <meta name="theme-color" content="#2ecc71">
  <link rel="manifest" href="manifest.json" />

  <style>
    body { font-family: Arial, sans-serif; background:#f4f6f8; margin:0; padding:20px; }
    .card { background:#fff; padding:15px; border-radius:12px; margin-bottom:15px; box-shadow:0 2px 6px rgba(0,0,0,.1); }
    h1,h2{ margin:0 0 10px 0; }
    button { width:100%; padding:12px; border:0; border-radius:8px; background:#2ecc71; color:#fff; font-size:16px; }
    input { width:100%; padding:10px; border-radius:8px; border:1px solid #ddd; margin-top:6px; }
    .muted{color:#666; font-size:14px;}
  </style>
</head>

<body>
  <h1>📅 Rutina Mea</h1>
  <p id="date" class="muted"></p>

  <div class="card">
    <h2>⏰ Program</h2>
    <p>Trezire: <b>05:50</b></p>
    <p>Lucru: <b>07:00</b></p>
    <p class="muted">Start: 1 ianuarie 2026</p>
  </div>

  <div class="card">
    <h2>🍽 Buget mâncare</h2>
    <p>Buget săptămânal: <b>50 €</b></p>
    <label>Cheltuit azi:</label>
    <input type="number" id="spent" placeholder="€" inputmode="decimal">
    <div style="height:10px"></div>
    <button id="saveBtn">Salvează</button>
    <p id="remaining" class="muted" style="margin-top:10px;"></p>
  </div>

  <div class="card">
    <h2>✅ Ziua de azi</h2>
    <button id="doneBtn">Am respectat ziua</button>
    <p id="status" class="muted" style="margin-top:10px;"></p>
  </div>

  <script>
    const WEEKLY_BUDGET = 50;

    const dateEl = document.getElementById("date");
    const spentEl = document.getElementById("spent");
    const remainingEl = document.getElementById("remaining");
    const statusEl = document.getElementById("status");

    dateEl.textContent = new Date().toLocaleDateString("ro-RO", {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    });

    function load() {
      const spent = Number(localStorage.getItem("spentToday") || 0);
      spentEl.value = spent ? String(spent) : "";
      remainingEl.textContent = "Buget rămas azi: " + (WEEKLY_BUDGET - spent).toFixed(2) + " €";

      const lastDone = localStorage.getItem("dayDone") || "";
      statusEl.textContent = lastDone ? ("✔ Zi respectată (" + lastDone + "). Fără alcool. Continuă!") : "";
    }

    document.getElementById("saveBtn").addEventListener("click", () => {
      const spent = Number(spentEl.value || 0);
      localStorage.setItem("spentToday", String(spent));
      remainingEl.textContent = "Buget rămas azi: " + (WEEKLY_BUDGET - spent).toFixed(2) + " €";
    });

    document.getElementById("doneBtn").addEventListener("click", () => {
      const stamp = new Date().toLocaleDateString("ro-RO");
      localStorage.setItem("dayDone", stamp);
      statusEl.textContent = "✔ Zi respectată (" + stamp + "). Fără alcool. Continuă!";
    });

    // PWA service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js");
    }

    load();
  </script>
</body>
</html>

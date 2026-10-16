
let dashboardData = null;
let revenueChart = null;
let demandChart = null;
let sortKey = "name";
let sortDirection = 1;

const $ = (id) => document.getElementById(id);

async function loadDashboardData() {
  try {
    const response = await fetch("./data.json");

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    dashboardData = await response.json();
    return true;
  } catch (error) {
    console.error("Unable to load dashboard data:", error);
    $("modelTableBody").innerHTML =
      '<tr><td colspan="5">Unable to load data.json. Run using Live Server.</td></tr>';
    return false;
  }
}

// Load metric cards from JSON
function renderMetrics() {
  const metrics = dashboardData.metrics;

  $("kpiAccuracy").textContent = metrics.accuracy;
  $("kpiPrecision").textContent = metrics.precision;
  $("kpiRecall").textContent = metrics.recall;
  $("kpiF1").textContent = metrics.f1;
}

// Small decorative lines inside metric cards
function drawMiniSparklines() {
  const sparks = [
    { id: "sparkAccuracy", color: "#2dd4bf", points: [5, 12, 10, 16, 14, 20, 18, 22] },
    { id: "sparkPrecision", color: "#0f766e", points: [12, 14, 13, 15, 12, 14, 16, 17] },
    { id: "sparkRecall", color: "#38bdf8", points: [4, 18, 12, 20, 15, 19, 14, 22] },
    { id: "sparkF1", color: "#34d399", points: [6, 14, 10, 18, 12, 19, 15, 21] }
  ];

  sparks.forEach(({ id, color, points }) => {
    const canvas = $(id);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.clientWidth || 200;
    const height = 35;
    const ratio = window.devicePixelRatio || 1;

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.scale(ratio, ratio);
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    points.forEach((point, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - point;

      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();
  });
}

// Revenue line chart
function renderRevenueChart(labels, values) {
  const ctx = $("revenueChart").getContext("2d");

  if (revenueChart) revenueChart.destroy();

  const gradient = ctx.createLinearGradient(0, 0, 0, 280);
  gradient.addColorStop(0, "rgba(45, 212, 191, 0.35)");
  gradient.addColorStop(1, "rgba(45, 212, 191, 0)");

  revenueChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Revenue (USD)",
        data: values,
        borderColor: "#0f766e",
        backgroundColor: gradient,
        borderWidth: 2.5,
        tension: 0.35,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: "#0f766e"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `Revenue: $${context.raw}K`
          }
        }
      },
      scales: {
        y: {
          ticks: {
            callback: (value) => `$${value}K`
          },
          grid: { color: "#e8efed", borderDash: [4, 4] }
        },
        x: { grid: { display: false } }
      }
    }
  });
}

// Demand bar chart
function renderDemandChart(labels, values) {
  const ctx = $("demandChart").getContext("2d");

  if (demandChart) demandChart.destroy();

  demandChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Predicted Demand",
        data: values,
        backgroundColor: [
          "#99f6e4", "#d8b4fe", "#bfdbfe", "#2d4a47",
          "#94a3b8", "#a7f3d0", "#fca5a5"
        ],
        borderRadius: 5,
        barThickness: 26
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) =>
              `Predicted Demand: ${Number(context.raw).toLocaleString()}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `${value / 1000}K`
          },
          grid: { color: "#e8efed", borderDash: [4, 4] }
        },
        x: { grid: { display: false } }
      }
    }
  });
}

// Filter, search, sort and display models
function renderTable() {
  const category = $("categoryFilter").value;
  const search = $("searchInput").value.trim().toLowerCase();

  let models = dashboardData.models.filter((model) => {
    const matchesCategory =
      category === "all" || model.type === category;

    const searchableText =
      `${model.name} ${model.type} ${model.accuracy} ${model.statusText}`.toLowerCase();

    return matchesCategory && searchableText.includes(search);
  });

  models.sort((a, b) => {
    let first = a[sortKey];
    let second = b[sortKey];

    if (sortKey === "accuracy") {
      first = parseFloat(first) || -1;
      second = parseFloat(second) || -1;
      return (first - second) * sortDirection;
    }

    return String(first).localeCompare(String(second)) * sortDirection;
  });

  $("modelCount").textContent =
    `${models.length} ${models.length === 1 ? "model" : "models"}`;

  const tbody = $("modelTableBody");
  tbody.replaceChildren();

  if (models.length === 0) {
    const row = tbody.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 5;
    cell.textContent = "No models found.";
    return;
  }

  models.forEach((model) => {
    const row = tbody.insertRow();

    [model.name, model.type, model.accuracy].forEach((value) => {
      const cell = row.insertCell();
      cell.textContent = value;
    });

    const statusCell = row.insertCell();
    const badge = document.createElement("span");
    badge.className = `status-badge ${model.status}`;
    badge.textContent = model.statusText;
    statusCell.appendChild(badge);

    const actionCell = row.insertCell();
    const viewButton = document.createElement("button");
    viewButton.className = "btn-view";
    viewButton.textContent = "View";
    viewButton.addEventListener("click", () => {
      alert(
        `Model: ${model.name}\n` +
        `Type: ${model.type}\n` +
        `Accuracy: ${model.accuracy}\n` +
        `Status: ${model.statusText}`
      );
    });
    actionCell.appendChild(viewButton);
  });
}



// Refresh dashboard using the latest JSON file
async function updateDashboard() {
  if (!dashboardData) {
    const loaded = await loadDashboardData();
    if (!loaded) return;
  }
  

  renderMetrics();

  const revenuePeriod = $("revenuePeriodSelect").value;
  const demandPeriod = $("demandPeriodSelect").value;

  const revenue = dashboardData.revenue[revenuePeriod];
  const demand = dashboardData.demand[demandPeriod];

  if (revenue) {
    renderRevenueChart(revenue.labels, revenue.values);
  }

  if (demand) {
    renderDemandChart(demand.labels, demand.values);
  }

  renderTable();
  $("lastRefreshedText").textContent =
    new Date().toLocaleTimeString();
}

// Export currently filtered and sorted models to CSV
function exportCSV() {
  const category = $("categoryFilter").value;
  const search = $("searchInput").value.trim().toLowerCase();

  const models = dashboardData.models.filter((model) => {
    const matchesCategory =
      category === "all" || model.type === category;

    const text =
      `${model.name} ${model.type} ${model.accuracy} ${model.statusText}`.toLowerCase();

    return matchesCategory && text.includes(search);
  });

  const headers = ["Model Name", "Type", "Accuracy", "Status"];
  const rows = models.map((model) => [
    model.name, model.type, model.accuracy, model.statusText
  ]);

  const csvCell = (value) =>
    `"${String(value).replace(/"/g, '""')}"`;

  const csv = [headers, ...rows]
    .map((row) => row.map(csvCell).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "ml-model-registry.csv";
  link.click();
  URL.revokeObjectURL(url);
}

// Event listeners
document.addEventListener("DOMContentLoaded", async () => {
  const loaded = await loadDashboardData();

  if (loaded) {
    drawMiniSparklines();
    await updateDashboard();
  }

  $("revenuePeriodSelect").addEventListener("change", updateDashboard);
  $("demandPeriodSelect").addEventListener("change", updateDashboard);
  $("categoryFilter").addEventListener("change", renderTable);
  $("searchInput").addEventListener("input", renderTable);
  $("clearSearch").addEventListener("click", () => {
    $("searchInput").value = "";
    renderTable();
  });

  document.querySelectorAll(".sort-button").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.sort;

      if (sortKey === key) {
        sortDirection *= -1;
      } else {
        sortKey = key;
        sortDirection = 1;
      }

      renderTable();
    });
  });

  $("btnRefresh").addEventListener("click", async () => {
    const button = $("btnRefresh");
    button.disabled = true;
    button.textContent = "Refreshing...";

    // Re-fetch the JSON file instead of using only cached data
    dashboardData = null;
    await updateDashboard();

    button.disabled = false;
    button.textContent = "↻ Refresh";
  });
  // 6. Export Action
  document.getElementById('btnExport').addEventListener('click', () => {
    alert('Dashboard exported as CSV / Report.');
  });

  $("exportBtn").addEventListener("click", exportCSV);
});

// ==========================================
// 1. DUMMY API SIMULATION
// ==========================================
const DummyAPI = {
  // Returns chart & registry data based on filter parameters
  fetchDashboard(revenueMonths = '6', demandRange = 'next7', category = 'all') {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Revenue Data based on period select
        const revenue = revenueMonths === '12' ? {
          labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
          values: [20, 22, 24, 26, 32, 31, 40, 48, 46, 62, 70, 75]
        } : {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
          values: [26, 32, 31, 40, 48, 46, 62, 70, 75]
        };

        // Demand Data based on range select
        const demand = demandRange === 'prev7' ? {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          values: [18000, 29000, 52000, 78000, 44000, 39000, 50000]
        } : {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          values: [23000, 35000, 65000, 95000, 55000, 45000, 60000]
        };

        // Registry models
        let models = [
          { name: 'Sales Forecasting', type: 'Regression', accuracy: '98.4%', status: 'training', statusText: 'Training 75%' },
          { name: 'Demand Prediction', type: 'Forecast', accuracy: '94.2%', status: 'active', statusText: 'Active' },
          { name: 'Customer Churn', type: 'Classification', accuracy: '91.8%', status: 'active', statusText: 'Active' },
          { name: 'Inventory Optimization', type: 'Optimization', accuracy: '-', status: 'pending', statusText: 'Pending' }
        ];

        if (category !== 'all') {
          models = models.filter(m => m.type.toLowerCase() === category.toLowerCase());
        }

        resolve({ revenue, demand, models });
      }, 250);
    });
  }
};

// ==========================================
// 2. CHART INSTANCES & RENDERERS
// ==========================================
let revenueChart = null;
let demandChart = null;

function renderRevenueChart(labels, values) {
  const ctx = document.getElementById('revenueChart').getContext('2d');
  
  // Custom teal gradient fill
  const gradient = ctx.createLinearGradient(0, 0, 0, 250);
  gradient.addColorStop(0, 'rgba(45, 212, 191, 0.45)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

  if (revenueChart) revenueChart.destroy();

  revenueChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Revenue (USD)',
        data: values,
        borderColor: '#0f524e',
        borderWidth: 2.5,
        backgroundColor: gradient,
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#0f524e',
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          ticks: {
            callback: (v) => `$${v}K`,
            stepSize: 25
          },
          grid: { borderDash: [3, 3], color: '#e2e8f0' }
        },
        x: { grid: { display: false } }
      }
    }
  });
}

function renderDemandChart(labels, values) {
  const ctx = document.getElementById('demandChart').getContext('2d');
  
  // Bar colors matching the reference screenshot
  const barColors = [
    '#99f6e4', // Teal light
    '#d8b4fe', // Purple
    '#bfdbfe', // Light Blue
    '#2d4a47', // Deep Charcoal
    '#94a3b8', // Gray
    '#a7f3d0', // Mint
    '#fca5a5'  // Coral
  ];

  if (demandChart) demandChart.destroy();

  demandChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: barColors,
        borderRadius: 4,
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
            label: (ctx) => `${ctx.raw.toLocaleString()}`
          }
        }
      },
      scales: {
        y: {
          ticks: {
            callback: (v) => `$${v / 1000}K`,
            stepSize: 25000
          },
          grid: { borderDash: [3, 3], color: '#e2e8f0' }
        },
        x: { grid: { display: false } }
      }
    }
  });
}

// Sparklines for top KPI cards using vanilla HTML5 Canvas
function drawMiniSparklines() {
  const sparks = [
    { id: 'sparkAccuracy', color: '#2dd4bf', points: [5, 12, 10, 16, 14, 20, 18, 22] },
    { id: 'sparkPrecision', color: '#0f766e', points: [12, 14, 13, 15, 12, 14, 16, 17] },
    { id: 'sparkRecall', color: '#38bdf8', points: [4, 18, 12, 20, 15, 19, 14, 22] },
    { id: 'sparkF1', color: '#34d399', points: [6, 14, 10, 18, 12, 19, 15, 21] }
  ];

  sparks.forEach(({ id, color, points }) => {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    points.forEach((pt, i) => {
      const x = (i / (points.length - 1)) * canvas.width;
      const y = canvas.height - pt;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  });
}

// ==========================================
// 3. TABLE POPULATION & SEARCH
// ==========================================
function renderTable(models) {
  const tbody = document.getElementById('modelTableBody');
  tbody.innerHTML = '';

  if (models.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#94a3b8; padding:20px;">No models found.</td></tr>`;
    return;
  }

  models.forEach(m => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${m.name}</td>
      <td>${m.type}</td>
      <td>${m.accuracy}</td>
      <td><span class="status-badge ${m.status}">${m.statusText}</span></td>
      <td><button class="btn-view" onclick="alert('Viewing model: ${m.name}')">View</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// ==========================================
// 4. CONTROLLER & EVENT LISTENERS
// ==========================================
async function updateDashboard() {
  const revPeriod = document.getElementById('revenuePeriodSelect').value;
  const demPeriod = document.getElementById('demandPeriodSelect').value;
  const category = document.getElementById('categoryFilter').value;

  const data = await DummyAPI.fetchDashboard(revPeriod, demPeriod, category);
  
  renderRevenueChart(data.revenue.labels, data.revenue.values);
  renderDemandChart(data.demand.labels, data.demand.values);
  renderTable(data.models);
}

document.addEventListener('DOMContentLoaded', () => {
  drawMiniSparklines();
  updateDashboard();

  // 1. Revenue Filter change
  document.getElementById('revenuePeriodSelect').addEventListener('change', updateDashboard);

  // 2. Demand Filter change
  document.getElementById('demandPeriodSelect').addEventListener('change', updateDashboard);

  // 3. Category Filter change
  document.getElementById('categoryFilter').addEventListener('change', updateDashboard);

  // 4. Refresh Button
  const refreshBtn = document.getElementById('btnRefresh');
  refreshBtn.addEventListener('click', async () => {
    refreshBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Refreshing...';
    await updateDashboard();
    document.getElementById('lastRefreshedText').textContent = 'Just now';
    setTimeout(() => {
      refreshBtn.innerHTML = '<i class="fa-solid fa-rotate"></i> Refresh';
    }, 400);
  });

  // 5. Search bar filtering on table
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#modelTableBody tr');
    rows.forEach(row => {
      const text = row.innerText.toLowerCase();
      row.style.display = text.includes(term) ? '' : 'none';
    });
  });

  document.getElementById('clearSearch').addEventListener('click', () => {
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('input'));
  });

  // 6. Export Action
  document.getElementById('btnExport').addEventListener('click', () => {
    alert('Dashboard exported as CSV / Report.');
  });
});
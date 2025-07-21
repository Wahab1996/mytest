const form = document.getElementById('expenseForm');
const table = document.getElementById('expensesTable').querySelector('tbody');

function saveExpenses(expenses) {
  localStorage.setItem('expenses', JSON.stringify(expenses));
}

function getExpenses() {
  return JSON.parse(localStorage.getItem('expenses')) || [];
}

function formatDateTime(date) {
  return date.toLocaleString('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function addExpenseToTable({ datetime, amount, note }) {
  const row = table.insertRow();
  row.innerHTML = `<td>${datetime}</td><td>${amount.toFixed(2)}</td><td>${note}</td>`;
}

function updateMonthlyTotal(expenses) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const total = expenses.reduce((sum, exp) => {
    const expDate = new Date(exp.timestamp);
    if (expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear) {
      return sum + exp.amount;
    }
    return sum;
  }, 0);

  const totalText = `📅 إجمالي المصروفات لهذا الشهر: ${total.toFixed(2)} ريال`;
  document.getElementById('monthlyTotal').textContent = totalText;
  document.getElementById('monthlyTotalPrint').textContent = totalText;
}

form.onsubmit = function (e) {
  e.preventDefault();
  const amount = parseFloat(document.getElementById('amount').value);
  const note = document.getElementById('note').value;
  const now = new Date();

  const datetime = formatDateTime(now);
  const expense = {
    datetime,
    timestamp: now.toISOString(),
    amount,
    note
  };

  const expenses = getExpenses();
  expenses.push(expense);
  saveExpenses(expenses);
  addExpenseToTable(expense);
  updateChart(expenses);
  updateMonthlyTotal(expenses);

  form.reset();
};

window.onload = function () {
  const expenses = getExpenses();
  expenses.forEach(addExpenseToTable);
  updateChart(expenses);
  updateMonthlyTotal(expenses);
};

function printExpenses() {
  const style = document.createElement('style');
  style.innerHTML = `
    body * { visibility: hidden; }
    .print-section, .print-section * { visibility: visible; }
    .print-section {
      position: absolute;
      top: 20px;
      left: 20px;
      width: 90%;
    }
  `;
  document.head.appendChild(style);
  window.print();
  document.head.removeChild(style);
}

let chart;

function updateChart(expenses) {
  const dailyTotals = {};

  expenses.forEach(exp => {
    const date = exp.datetime.split(",")[0];
    if (!dailyTotals[date]) dailyTotals[date] = 0;
    dailyTotals[date] += exp.amount;
  });

  const labels = Object.keys(dailyTotals);
  const data = Object.values(dailyTotals);

  const ctx = document.getElementById('expensesChart').getContext('2d');

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'إجمالي المصروفات اليومية',
        data: data,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}
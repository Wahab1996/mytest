const form = document.getElementById('expenseForm');
const table = document.getElementById('expensesTable').querySelector('tbody');

function saveExpenses(expenses) {
  localStorage.setItem('expenses', JSON.stringify(expenses));
}

function getExpenses() {
  return JSON.parse(localStorage.getItem('expenses')) || [];
}

function addExpenseToTable({ datetime, amount, note }) {
  const row = table.insertRow();
  row.innerHTML = `<td>${datetime}</td><td>${amount}</td><td>${note}</td>`;
}

function updateMonthlyTotal(expenses) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const total = expenses.reduce((sum, exp) => {
    const expDate = new Date(exp.datetime);
    if (expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear) {
      return sum + exp.amount;
    }
    return sum;
  }, 0);

  document.getElementById('monthlyTotal').textContent =
    `📅 إجمالي المصروفات لهذا الشهر: ${total.toFixed(2)} ريال`;
}

form.onsubmit = function (e) {
  e.preventDefault();
  const amount = parseFloat(document.getElementById('amount').value);
  const note = document.getElementById('note').value;

  const now = new Date();
  const datetime = now.toLocaleString('en-GB'); // dd/mm/yyyy, hh:mm:ss

  const expense = { datetime, amount, note };
  const expenses = getExpenses();
  expenses.push(expense);
  saveExpenses(expenses);
  addExpenseToTable(expense);
  updateMonthlyTotal(expenses);
  updateChart(expenses);

  form.reset();
};

window.onload = function () {
  const expenses = getExpenses();
  expenses.forEach(addExpenseToTable);
  updateMonthlyTotal(expenses);
  updateChart(expenses);
};

let chart;

function updateChart(expenses) {
  const dailyTotals = {};

  expenses.forEach(exp => {
    const date = exp.datetime.split(",")[0]; // التاريخ فقط
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
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// ✅ طباعة التقرير (رسم + جدول + الإجمالي فقط)
function printReport() {
  window.print();
}
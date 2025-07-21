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

form.onsubmit = function (e) {
  e.preventDefault();
  const amount = document.getElementById('amount').value;
  const note = document.getElementById('note').value;

  const now = new Date();
  const datetime = now.toLocaleString('ar-SA'); // تاريخ ووقت

  const expense = { datetime, amount: parseFloat(amount), note };
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
  window.print();
}

// 🎯 رسم بياني للمصاريف اليومية فقط حسب التاريخ
let chart;

function updateChart(expenses) {
  updateMonthlyTotal(expenses);
  const dailyTotals = {};

  expenses.forEach(exp => {
    const date = exp.datetime.split(",")[0]; // نأخذ التاريخ فقط من التاريخ والوقت
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
function printReport() {
  const content = document.getElementById('printable').innerHTML;
  const style = `
    <style>
      body { font-family: Arial; padding: 20px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
      canvas { max-width: 100% !important; margin-bottom: 20px; }
      h3 { text-align: center; }
    </style>
  `;
  const win = window.open('', '', 'height=800,width=800');
  win.document.write('<html><head><title>تقرير المصروفات</title>');
  win.document.write(style);
  win.document.write('</head><body>');
  win.document.write(content);
  win.document.write('</body></html>');
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
    win.close();
  }, 500);
}
function updateMonthlyTotal(expenses) {
  const now = new Date();
  const currentMonth = now.getMonth(); // من 0 إلى 11
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
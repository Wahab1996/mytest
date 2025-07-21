function getTodayHijri() {
  const now = new Date();
  return now.toLocaleString('ar-SA-u-ca-islamic', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

function loadExpenses() {
  return JSON.parse(localStorage.getItem("expenses") || "[]");
}

function saveExpenses(expenses) {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

function addExpense() {
  const amount = parseFloat(document.getElementById("amount").value);
  const note = document.getElementById("note").value;
  if (!amount) return alert("الرجاء إدخال مبلغ صحيح");

  const expenses = loadExpenses();
  expenses.push({
    amount,
    note,
    datetime: new Date().toISOString(),
    displayDate: new Date().toLocaleString('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  });
  saveExpenses(expenses);
  document.getElementById("amount").value = "";
  document.getElementById("note").value = "";
  renderTable(expenses);
  updateChart(expenses);
  updateMonthlyTotal(expenses);
}

function renderTable(expenses) {
  const tbody = document.getElementById("expenseTableBody");
  tbody.innerHTML = "";
  expenses.forEach(exp => {
    const row = `<tr>
      <td>${exp.displayDate}</td>
      <td>${exp.amount}</td>
      <td>${exp.note || ""}</td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

function updateChart(expenses) {
  const totalsByDate = {};
  expenses.forEach(exp => {
    const date = exp.hijriDate.split(',')[0];
    if (!totalsByDate[date]) totalsByDate[date] = 0;
    totalsByDate[date] += exp.amount;
  });

  const labels = Object.keys(totalsByDate);
  const data = Object.values(totalsByDate);

  if (window.expenseChart) window.expenseChart.destroy();

  const ctx = document.getElementById('expenseChart').getContext('2d');
  window.expenseChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'مجموع المصروفات بالريال',
        data,
        backgroundColor: '#4CAF50'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
      }
    }
  });
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

document.addEventListener("DOMContentLoaded", () => {
  const expenses = loadExpenses();
  renderTable(expenses);
  updateChart(expenses);
  updateMonthlyTotal(expenses);
});
// -------------------------------
// Load Data from localStorage
// -------------------------------
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Select elements
const type = document.getElementById("type");
const desc = document.getElementById("desc");
const amount = document.getElementById("amount");
const date = document.getElementById("date");
const addBtn = document.getElementById("addBtn");
const history = document.getElementById("history");

const totalIncome = document.getElementById("totalIncome");
const totalExpense = document.getElementById("totalExpense");
const balance = document.getElementById("balance");

const modal = document.getElementById("modal");
const modalMessage = document.getElementById("modalMessage");
const closeModal = document.getElementById("closeModal");

// -------------------------------
// Show Modal Message
// -------------------------------
function showModal(message) {
  modalMessage.innerText = message;
  modal.style.display = "block";
}

closeModal.onclick = () => {
  modal.style.display = "none";
};

// -------------------------------
// Add Transaction
// -------------------------------
addBtn.addEventListener("click", () => {
  if (desc.value === "" || amount.value === "" || date.value === "") {
    showModal("Please fill out all fields!");
    return;
  }

  const transaction = {
    type: type.value,
    desc: desc.value,
    amount: Number(amount.value),
    date: date.value,
    id: Date.now(),
  };

  transactions.push(transaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));

  showModal("Transaction added successfully!");
  updateUI();
  clearInputs();
});

// -------------------------------
// Clear form fields
// -------------------------------
function clearInputs() {
  desc.value = "";
  amount.value = "";
  date.value = "";
}

// -------------------------------
// Update Dashboard Values
// -------------------------------
function updateUI() {
  let income = 0,
    expense = 0;

  history.innerHTML = "";

  transactions.forEach((t) => {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;

    history.innerHTML += `
      <div class="history-item">
        <p>${t.date} - ${t.desc}</p>
        <p style="color:${t.type === "income" ? "green" : "red"};">
          ${t.type === "income" ? "+" : "-"}₹${t.amount}
        </p>
      </div>
    `;
  });

  totalIncome.innerText = income;
  totalExpense.innerText = expense;
  balance.innerText = income - expense;

  updateCharts(income, expense);
}

// -------------------------------
// Pie and Bar Charts using Chart.js
// -------------------------------
let pieChart, barChart;

function updateCharts(income, expense) {
  // Destroy previous charts
  if (pieChart) pieChart.destroy();
  if (barChart) barChart.destroy();

  const ctx1 = document.getElementById("pieChart").getContext("2d");
  const ctx2 = document.getElementById("barChart").getContext("2d");

  // Pie chart
  pieChart = new Chart(ctx1, {
    type: "pie",
    data: {
      labels: ["Income", "Expense"],
      datasets: [
        {
          data: [income, expense],
          backgroundColor: ["#4CAF50", "#F44336"],
        },
      ],
    },
  });

  // Bar chart
  barChart = new Chart(ctx2, {
    type: "bar",
    data: {
      labels: ["Income", "Expense"],
      datasets: [
        {
          label: "Amount",
          data: [income, expense],
          backgroundColor: ["#4CAF50", "#F44336"],
        },
      ],
    },
    options: {
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}

// -------------------------------
// Sign Out
// -------------------------------
document.getElementById("signOutBtn").addEventListener("click", () => {
  showModal("You have signed out!");
});

// -------------------------------
// Load UI when page starts
// -------------------------------
updateUI();
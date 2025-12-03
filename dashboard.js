document.addEventListener("DOMContentLoaded", () => {
  // -------------------------------
  // Get logged-in user
  // -------------------------------
  let loggedInUser = localStorage.getItem("loggedInUser");

  // -------------------------------
  // Load Data from localStorage (user-specific)
  // -------------------------------
  let transactions = [];

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

  const signOutBtn = document.getElementById("signOutBtn");
  const signInBtn = document.getElementById("signInBtn");
  const usernameInput = document.getElementById("username");

  // -------------------------------
  // Show Modal Message
  // -------------------------------
  function showModal(message) {
    if (!modal || !modalMessage) return;
    modalMessage.innerText = message;
    modal.style.display = "block";
  }

  if (closeModal) {
    closeModal.onclick = () => {
      modal.style.display = "none";
    };
  }

  // -------------------------------
  // Add Transaction
  // -------------------------------
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      // Require a logged-in user
      if (!loggedInUser) {
        showModal("Please sign in first.");
        return;
      }

      if (!desc || !amount || !date || !type) return;

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

      // SAVE transactions for this specific user
      localStorage.setItem("transactions_" + loggedInUser, JSON.stringify(transactions));

      showModal("Transaction added successfully!");
      updateUI();
      clearInputs();
    });
  }

  // -------------------------------
  // Clear form fields
  // -------------------------------
  function clearInputs() {
    if (!desc || !amount || !date) return;
    desc.value = "";
    amount.value = "";
    date.value = "";
  }

  // -------------------------------
  // Update Dashboard Values
  // -------------------------------
  function updateUI() {
    if (!history || !totalIncome || !totalExpense || !balance) return;

    let income = 0;
    let expense = 0;

    history.innerHTML = "";

    // LIMIT number of transactions shown
    const limit = 5;
    const visibleTransactions = transactions.slice(-limit);

    visibleTransactions.forEach((t) => {
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
    const pieCanvas = document.getElementById("pieChart");
    const barCanvas = document.getElementById("barChart");

    // If charts or Chart.js aren't available, safely skip
    if (!pieCanvas || !barCanvas || typeof Chart === "undefined") return;

    const ctx1 = pieCanvas.getContext("2d");
    const ctx2 = barCanvas.getContext("2d");

    if (pieChart) pieChart.destroy();
    if (barChart) barChart.destroy();

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
  // Initialize for current user
  // -------------------------------
  function init() {
    // If no user, show empty state and skip loading
    if (!loggedInUser) {
      transactions = [];
      updateUI(); // will show zeros and empty history
      return;
    }

    const raw = localStorage.getItem("transactions_" + loggedInUser);
    try {
      transactions = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(transactions)) transactions = [];
    } catch {
      transactions = [];
    }

    updateUI();
  }

  // Call init when page loads
  init();

  // -------------------------------
  // Sign In Flow
  // -------------------------------
  if (signInBtn) {
    signInBtn.addEventListener("click", () => {
      const username = usernameInput ? usernameInput.value.trim() : "";

      if (username === "") {
        showModal("Please enter a username!");
        return;
      }

      // Save logged-in user
      localStorage.setItem("loggedInUser", username);
      loggedInUser = username;

      showModal("Welcome, " + username + "!");

      // Load their transactions immediately
      init();
    });
  }

  // -------------------------------
  // Sign Out
  // -------------------------------
  if (signOutBtn) {
    signOutBtn.addEventListener("click", () => {
      showModal("You have signed out!");
      // Optional: clear current session without deleting data
      loggedInUser = null;
      // Optional: localStorage.removeItem("loggedInUser"); // if you want to fully sign out
      init(); // refresh UI to empty state
    });
  }
});
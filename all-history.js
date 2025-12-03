// -------------------------------
// Get logged-in user
// -------------------------------
const loggedInUser = localStorage.getItem("loggedInUser");

// -------------------------------
// Load Data from localStorage (user-specific)
// -------------------------------
let transactions = [];
if (loggedInUser) {
  transactions = JSON.parse(localStorage.getItem("transactions_" + loggedInUser)) || [];
}

// Select elements
const allHistoryDiv = document.getElementById("allHistory");
const filterSelect = document.getElementById("filter");
const fromDateInput = document.getElementById("fromDate");
const toDateInput = document.getElementById("toDate");
const applyRangeBtn = document.getElementById("applyRange");
const nav = document.getElementById("navbar");

// -------------------------------
// Navigation buttons
// -------------------------------
document.getElementById("homeBtn").onclick = () => window.location.href = "homepage.html";
document.getElementById("servicesBtn").onclick = () => window.location.href = "services.html";
document.getElementById("aboutBtn").onclick = () => window.location.href = "about.html";

// -------------------------------
// Add dynamic nav buttons
// -------------------------------
if (!loggedInUser) {
  let signup = document.createElement("button");
  signup.innerText = "Sign-Up";
  signup.onclick = () => window.location.href = "signup.html";

  let signin = document.createElement("button");
  signin.innerText = "Sign-In";
  signin.onclick = () => window.location.href = "signin.html";

  nav.appendChild(signup);
  nav.appendChild(signin);
} else {
  let dashboard = document.createElement("button");
  dashboard.innerText = "Dashboard";
  dashboard.onclick = () => window.location.href = "dashboard.html";

  let signout = document.createElement("button");
  signout.innerText = "Sign Out";
  signout.onclick = () => {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    users = users.map(user => {
      if (user.email === loggedInUser) {
        user.state = "inactive";
      }
      return user;
    });
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.removeItem("loggedInUser");
    alert("Signed out successfully!");
    window.location.href = "signin.html";
  };

  nav.appendChild(dashboard);
  nav.appendChild(signout);
}

// -------------------------------
// Helper: get start/end dates for fixed filters
// -------------------------------
function getDateRange(option) {
  const now = new Date();
  let start = new Date();
  let end = new Date();

  switch(option) {
    case "thisWeek":
      start.setDate(now.getDate() - now.getDay()); // Sunday
      break;
    case "lastWeek":
      start.setDate(now.getDate() - now.getDay() - 7);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      break;
    case "thisMonth":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "lastMonth":
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    default:
      return null;
  }
  return { start, end };
}

// -------------------------------
// Render transactions
// -------------------------------
function renderTransactions(option, customRange = null) {
  allHistoryDiv.innerHTML = "";
  let filtered = transactions;

  if (customRange) {
    filtered = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= customRange.start && txDate <= customRange.end;
    });
  } else if (option !== "all") {
    const range = getDateRange(option);
    if (range) {
      filtered = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate >= range.start && txDate <= (range.end || new Date());
      });
    }
  }

  if (filtered.length === 0) {
    allHistoryDiv.innerHTML = `<tr><td colspan="4" style="text-align:center;">No transactions found</td></tr>`;
    return;
  }

  filtered.forEach((tx, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${tx.date}</td>
      <td>${tx.desc}</td>
      <td style="color:${tx.type === "income" ? "green" : "red"};">
        ${tx.type === "income" ? "+" : "-"}₹${tx.amount}
      </td>
      <td>
        <button class="small-btn edit-btn">✏️</button>
        <button class="small-btn delete-btn">🗑️</button>
      </td>
    `;

    // Delete handler
    row.querySelector(".delete-btn").onclick = () => {
      if (confirm("Are you sure you want to delete this transaction?")) {
        transactions.splice(index, 1);
        localStorage.setItem("transactions_" + loggedInUser, JSON.stringify(transactions));
        renderTransactions(option, customRange);
      }
    };

    // Edit handler
    row.querySelector(".edit-btn").onclick = () => {
      if (confirm("Do you want to edit this transaction?")) {
        row.innerHTML = `
          <td><input type="date" value="${tx.date}" class="edit-date"></td>
          <td><input type="text" value="${tx.desc}" class="edit-desc"></td>
          <td>
            <input type="number" value="${tx.amount}" class="edit-amount">
            <select class="edit-type">
              <option value="income" ${tx.type === "income" ? "selected" : ""}>Income</option>
              <option value="expense" ${tx.type === "expense" ? "selected" : ""}>Expense</option>
            </select>
          </td>
          <td>
            <button class="small-btn save-btn">💾</button>
            <button class="small-btn cancel-btn">❌</button>
          </td>
        `;

        // Save handler
        row.querySelector(".save-btn").onclick = () => {
          const newDate = row.querySelector(".edit-date").value;
          const newDesc = row.querySelector(".edit-desc").value;
          const newAmount = parseFloat(row.querySelector(".edit-amount").value);
          const newType = row.querySelector(".edit-type").value;

          if (newDate && newDesc && !isNaN(newAmount)) {
            tx.date = newDate;
            tx.desc = newDesc;
            tx.amount = newAmount;
            tx.type = newType;

            localStorage.setItem("transactions_" + loggedInUser, JSON.stringify(transactions));
            renderTransactions(option, customRange);

            // Show modal confirmation
            const modal = document.getElementById("successModal");
            const closeBtn = document.getElementById("closeModal");
            const msg = document.getElementById("modalMessage");

            msg.textContent = "Transaction updated successfully!";
            modal.style.display = "block";

            closeBtn.onclick = () => { modal.style.display = "none"; };
            window.onclick = (event) => {
              if (event.target === modal) {
                modal.style.display = "none";
              }
            };
          }
        };

        // Cancel handler
        row.querySelector(".cancel-btn").onclick = () => {
          renderTransactions(option, customRange);
        };
      }
    };

    allHistoryDiv.appendChild(row);
  });
}

// -------------------------------
// Initial load
// -------------------------------
renderTransactions("all");

// -------------------------------
// On filter change
// -------------------------------
filterSelect.addEventListener("change", e => {
  renderTransactions(e.target.value);
});

// -------------------------------
// On custom range apply
// -------------------------------
applyRangeBtn.addEventListener("click", () => {
  const fromDate = new Date(fromDateInput.value);
  const toDate = new Date(toDateInput.value);
  if (fromDateInput.value && toDateInput.value) {
    renderTransactions(null, { start: fromDate, end: toDate });
  }
});
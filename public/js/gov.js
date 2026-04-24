// ============================================
// Government Dashboard JavaScript
// Handles: Create tasks, view tasks, assign tasks
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  // Show logged-in username
  const username = localStorage.getItem("username") || "admin";
  document.getElementById("user-display").textContent = username;

  // Load initial data
  loadTasks();
  loadNGOList();
  loadHelpRequests(); // ✅ ADDED HERE


  // --- Create Task Form ---
  document.getElementById("task-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const taskData = {
      title: document.getElementById("task-title").value.trim(),
      description: document.getElementById("task-description").value.trim(),
      location: document.getElementById("task-location").value.trim(),
      resources_required: document.getElementById("task-resources").value.trim(),
    };

    try {
      const res = await fetch("/create-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      const data = await res.json();

      if (data.success) {
        showAlert(data.message, "success");
        document.getElementById("task-form").reset();
        loadTasks();
        loadHelpRequests(); // optional refresh
      } else {
        showAlert(data.message, "error");
      }
    } catch (err) {
      showAlert("Failed to create task.", "error");
    }
  });

  // --- Assign Task Form ---
  document.getElementById("assign-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const assignData = {
      task_id: document.getElementById("assign-task-id").value,
      ngo_username: document.getElementById("assign-ngo").value,
    };

    try {
      const res = await fetch("/assign-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignData),
      });
      const data = await res.json();

      if (data.success) {
        showAlert(data.message, "success");
        document.getElementById("assign-form").reset();
        loadTasks();
      } else {
        showAlert(data.message, "error");
      }
    } catch (err) {
      showAlert("Failed to assign task.", "error");
    }
  });
});

// ============================================
// 🔥 NEW: Load Help Requests
// ============================================
async function loadHelpRequests() {
  try {
    const res = await fetch("/help-requests");
    const data = await res.json();

    const tbody = document.getElementById("requests-table-body");

    if (!data.success || data.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No requests found</td></tr>`;
      return;
    }

    let html = "";

    data.data.forEach(r => {
      html += `
        <tr>
          <td><strong>#${r.request_id}</strong></td>
          <td>${r.title}</td>
          <td>${r.location}</td>
          <td>${r.people_affected}</td>
          <td>${r.urgency}</td>
          <td><span class="status-badge">${r.status}</span></td>
        </tr>
      `;
    });

    tbody.innerHTML = html;

  } catch (err) {
    console.error("Load help requests error:", err);
  }
}

// ============================================
// Load all tasks
// ============================================
async function loadTasks() {
  try {
    const res = await fetch("/tasks");
    const tasks = await res.json();

    document.getElementById("stat-total").textContent = tasks.length;
    document.getElementById("stat-pending").textContent = tasks.filter(t => t.status === "pending").length;
    document.getElementById("stat-assigned").textContent = tasks.filter(t => t.status === "assigned" || t.status === "in-progress").length;
    document.getElementById("stat-completed").textContent = tasks.filter(t => t.status === "completed").length;

    const tbody = document.getElementById("tasks-table-body");

    if (tasks.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="empty-state">No tasks found</td></tr>`;
      return;
    }

    tbody.innerHTML = tasks.map(task => `
      <tr>
        <td><strong>#${task.task_id}</strong></td>
        <td>${task.title}</td>
        <td>${task.location}</td>
        <td>${task.resources_required || "—"}</td>
        <td><span class="status-badge status-${task.status}">${task.status}</span></td>
      </tr>
    `).join("");

    const select = document.getElementById("assign-task-id");
    select.innerHTML = '<option value="">-- Choose a Task --</option>';

    tasks.filter(t => t.status === "pending").forEach(task => {
      select.innerHTML += `<option value="${task.task_id}">#${task.task_id} - ${task.title}</option>`;
    });

  } catch (err) {
    console.error("Load tasks error:", err);
  }
}

// ============================================
// Load NGO list
// ============================================
async function loadNGOList() {
  try {
    const res = await fetch("/ngo-list");
    const ngos = await res.json();

    const select = document.getElementById("assign-ngo");
    select.innerHTML = '<option value="">-- Choose an NGO --</option>';

    ngos.forEach(ngo => {
      select.innerHTML += `<option value="${ngo.username}">${ngo.username}</option>`;
    });

  } catch (err) {
    console.error("Load NGO list error:", err);
  }
}

// ============================================
// Alert
// ============================================
function showAlert(message, type) {
  const alertMsg = document.getElementById("alert-msg");
  alertMsg.textContent = message;
  alertMsg.className = `alert alert-${type} show`;
  setTimeout(() => alertMsg.classList.remove("show"), 4000);
}

// ============================================
// Logout
// ============================================
function logout() {
  localStorage.clear();
  window.location.href = "/login.html";
}
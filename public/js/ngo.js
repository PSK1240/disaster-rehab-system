// ============================================
// NGO Dashboard JavaScript
// Handles: View assigned tasks, update status/remarks
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  // Get logged-in NGO username
  const username = localStorage.getItem("username") || "ngo_hope";
  document.getElementById("user-display").textContent = username;

  // Load assigned tasks
  loadAssignedTasks(username);

  // --- Update Assignment Form ---
  document.getElementById("update-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("update-id").value;
    const status = document.getElementById("update-status").value;
    const remarks = document.getElementById("update-remarks").value.trim();

    try {
      const res = await fetch(`/update-assignment/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, remarks }),
      });
      const data = await res.json();

      if (data.success) {
        showAlert(data.message, "success");
        hideUpdateForm();
        loadAssignedTasks(username); // Refresh table
      } else {
        showAlert(data.message, "error");
      }
    } catch (err) {
      showAlert("Failed to update assignment.", "error");
    }
  });
});

// --- Load all tasks assigned to this NGO ---
async function loadAssignedTasks(ngoUsername) {
  try {
    const res = await fetch(`/assigned-tasks/${ngoUsername}`);
    const tasks = await res.json();

    // Update stats
    document.getElementById("stat-total").textContent = tasks.length;
    document.getElementById("stat-progress").textContent = tasks.filter(t => t.assignment_status === "in-progress").length;
    document.getElementById("stat-done").textContent = tasks.filter(t => t.assignment_status === "completed").length;

    // Build table
    const tbody = document.getElementById("assigned-table-body");
    if (tasks.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="empty-state"><div class="empty-icon">📭</div>No tasks assigned to you yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = tasks.map(t => `
      <tr>
        <td><strong>#${t.task_id}</strong></td>
        <td>${t.title}</td>
        <td>${t.location}</td>
        <td>${t.resources_required || "—"}</td>
        <td><span class="status-badge status-${t.assignment_status}">${t.assignment_status}</span></td>
        <td>${t.remarks || "—"}</td>
        <td>
          <button class="btn btn-primary btn-sm" onclick="showUpdateForm(${t.id}, '${t.assignment_status}', '${(t.remarks || "").replace(/'/g, "\\'")}')">
            ✏️ Update
          </button>
        </td>
      </tr>
    `).join("");

  } catch (err) {
    console.error("Load assigned tasks error:", err);
  }
}

// --- Show the update form pre-filled ---
function showUpdateForm(id, currentStatus, currentRemarks) {
  document.getElementById("update-id").value = id;
  document.getElementById("update-status").value = currentStatus;
  document.getElementById("update-remarks").value = currentRemarks;
  document.getElementById("update-card").style.display = "block";
  document.getElementById("update-card").scrollIntoView({ behavior: "smooth" });
}

// --- Hide the update form ---
function hideUpdateForm() {
  document.getElementById("update-card").style.display = "none";
}

// --- Show alert ---
function showAlert(message, type) {
  const alertMsg = document.getElementById("alert-msg");
  alertMsg.textContent = message;
  alertMsg.className = `alert alert-${type} show`;
  setTimeout(() => alertMsg.classList.remove("show"), 4000);
}

// --- Logout ---
function logout() {
  localStorage.clear();
  window.location.href = "/login.html";
}

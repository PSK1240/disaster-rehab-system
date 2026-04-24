// ============================================
// Registration Page JavaScript
// ============================================

function toggleRoleFields() {
  const role = document.getElementById("role").value;
  const orgGroup = document.getElementById("organization-group");

  if (role === "ngo" || role === "government") {
    orgGroup.style.display = "block";
  } else {
    orgGroup.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("register-form");
  const alertMsg = document.getElementById("alert-msg");

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Reset alert
      alertMsg.style.display = "none";
      alertMsg.className = "alert";

      // Gather data
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();
      const role = document.getElementById("role").value;
      const full_name = document.getElementById("fullName").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const email = document.getElementById("email").value.trim();
      const organization = document.getElementById("organization").value.trim();
      const address = document.getElementById("address").value.trim();

      if (!username || !password || !role) {
        showAlert("error", "Username, password, and role are required.");
        return;
      }

      try {
        const response = await fetch("/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password, role, full_name, phone, email, organization, address }),
        });

        const data = await response.json();

        if (data.success) {
          showAlert("success", data.message + " Redirecting to login...");
          setTimeout(() => {
            window.location.href = "/login.html";
          }, 2000);
        } else {
          showAlert("error", data.message || "Registration failed.");
        }
      } catch (err) {
        console.error("Registration error:", err);
        showAlert("error", "Failed to connect to the server. Please try again later.");
      }
    });
  }

  function showAlert(type, message) {
    alertMsg.textContent = message;
    alertMsg.className = `alert alert-${type}`;
    alertMsg.style.display = "block";
  }
});

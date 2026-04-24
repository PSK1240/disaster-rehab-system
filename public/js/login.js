// ============================================
// Login Page JavaScript
// Handles user authentication via POST /login
// ============================================

// Wait for the page to load
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const alertMsg = document.getElementById("alert-msg");

  // Hide register form initially (if exists)
  const regForm = document.getElementById("registerForm");
  if (regForm) regForm.style.display = "none";

  // Handle login form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent page refresh

    // Get form values
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    // Basic validation
    if (!username || !password) {
      showAlert("Please enter both username and password.", "error");
      return;
    }

    try {
      // Send POST request to /login API
      const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Save user data
        localStorage.setItem("username", data.username);
        localStorage.setItem("role", data.role);

        showAlert(data.message, "success");

        // Redirect based on role
        setTimeout(() => {
          if (data.role === "government") window.location.href = "/gov.html";
          else if (data.role === "ngo") window.location.href = "/ngo.html";
          else if (data.role === "citizen") window.location.href = "/citizen.html";
        }, 800);
      } else {
        showAlert(data.message, "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      showAlert("Unable to connect to server.", "error");
    }
  });

  // Helper: Show alert message
  function showAlert(message, type) {
    alertMsg.textContent = message;
    alertMsg.className = `alert alert-${type} show`;

    setTimeout(() => {
      alertMsg.classList.remove("show");
    }, 5000);
  }

  // =========================================================
  // REGISTER FUNCTIONS (GLOBAL so HTML onclick works)
  // =========================================================

  window.showRegister = function () {
    const regForm = document.getElementById("registerForm");
    if (regForm) regForm.style.display = "block";
  };

  window.register = async function () {
    const data = {
      username: document.getElementById("reg_username").value,
      full_name: document.getElementById("reg_fullname").value,
      phone: document.getElementById("reg_phone").value,
      email: document.getElementById("reg_email").value,
      password: document.getElementById("reg_password").value,
      role: document.getElementById("reg_role").value,
      organization: document.getElementById("reg_org").value,
      address: document.getElementById("reg_address").value
    };

    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      showAlert(result.message, result.success ? "success" : "error");

      // Clear form after success
      if (result.success) {
        document.getElementById("registerForm").reset();
      }

    } catch (err) {
      console.error(err);
      showAlert("Registration failed", "error");
    }
  };

});
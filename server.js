// ============================================
// Post-Disaster Rehabilitation Coordination System
// Backend Server - Express + MySQL
// ============================================

const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const PORT = 3000;

// --- Middleware ---
// Parse incoming JSON request bodies
app.use(express.json());

// Serve all files inside the "public" folder as static files
app.use(express.static(path.join(__dirname, "public")));

// --- MySQL Database Connection ---
// Update these values to match your MySQL setup
const db = mysql.createConnection({
  host: "localhost",
  user: "root",           // your MySQL username
  password: "root",       // your MySQL password
  database: "disaster_rehab", // database name
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err.message);
    console.log("💡 Make sure MySQL is running and the database 'disaster_rehab' exists.");
    console.log("💡 Run the setup.sql file first to create the database and tables.");
  } else {
    console.log("✅ Connected to MySQL database.");
  }
});

// ============================================
// ROUTES
// ============================================

// --- Root: Redirect to login page ---
app.get("/", (req, res) => {
  res.redirect("/login.html");
});

// ------------------------------------------
// 1. LOGIN API
// ------------------------------------------
// POST /login
// Body: { username, password }
// Returns: { success, role, message }
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.json({ success: false, message: "Username and password are required." });
  }

  // Query the database with prepared statement
  const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error("Login query error:", err);
      return res.json({ success: false, message: "Server error. Please try again." });
    }

    // Check if user was found
    if (results.length > 0) {
      const user = results[0];
      res.json({
        success: true,
        role: user.role,
        username: user.username,
        message: `Welcome back, ${user.username}!`,
      });
    } else {
      res.json({ success: false, message: "Invalid username or password." });
    }
  });
});

// ------------------------------------------
// 2. TASK APIs (Government Module)
// ------------------------------------------

// POST /create-task
// Body: { title, description, location, resources_required }
// Creates a new disaster rehabilitation task
app.post("/create-task", (req, res) => {
  const { title, description, location, resources_required } = req.body;

  // Validate input
  if (!title || !description || !location) {
    return res.json({ success: false, message: "Title, description, and location are required." });
  }

  const sql = `INSERT INTO tasks (title, description, location, resources_required, status) 
               VALUES (?, ?, ?, ?, 'pending')`;
  db.query(sql, [title, description, location, resources_required || ""], (err, result) => {
    if (err) {
      console.error("Create task error:", err);
      return res.json({ success: false, message: "Failed to create task." });
    }
    res.json({
      success: true,
      message: "Task created successfully!",
      task_id: result.insertId,
    });
  });
});

// GET /tasks
// Returns all tasks from the database
app.get("/tasks", (req, res) => {
  const sql = "SELECT * FROM tasks ORDER BY task_id DESC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Fetch tasks error:", err);
      return res.json([]);
    }
    res.json(results);
  });
});

// POST /assign-task
// Body: { task_id, ngo_username }
// Assigns a task to an NGO
app.post("/assign-task", (req, res) => {
  const { task_id, ngo_username } = req.body;

  // Validate input
  if (!task_id || !ngo_username) {
    return res.json({ success: false, message: "Task ID and NGO username are required." });
  }

  // First, check if the NGO user exists
  const checkSql = "SELECT * FROM users WHERE username = ? AND role = 'ngo'";
  db.query(checkSql, [ngo_username], (err, users) => {
    if (err) {
      console.error("Check NGO error:", err);
      return res.json({ success: false, message: "Server error." });
    }

    if (users.length === 0) {
      return res.json({ success: false, message: "NGO user not found." });
    }

    // Insert the assignment
    const sql = `INSERT INTO task_assignments (task_id, ngo_username, status, remarks) 
                 VALUES (?, ?, 'assigned', '')`;
    db.query(sql, [task_id, ngo_username], (err, result) => {
      if (err) {
        console.error("Assign task error:", err);
        return res.json({ success: false, message: "Failed to assign task." });
      }

      // Update task status to 'assigned'
      const updateSql = "UPDATE tasks SET status = 'assigned' WHERE task_id = ?";
      db.query(updateSql, [task_id], (err2) => {
        if (err2) console.error("Update task status error:", err2);
      });

      res.json({ success: true, message: `Task assigned to ${ngo_username} successfully!` });
    });
  });
});

// GET /ngo-list
// Returns all NGO usernames (used in government dropdown)
app.get("/ngo-list", (req, res) => {
  const sql = "SELECT username FROM users WHERE role = 'ngo'";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Fetch NGO list error:", err);
      return res.json([]);
    }
    res.json(results);
  });
});

// ------------------------------------------
// 3. NGO APIs
// ------------------------------------------

// GET /assigned-tasks/:ngo
// Returns all tasks assigned to a specific NGO
app.get("/assigned-tasks/:ngo", (req, res) => {
  const ngoUsername = req.params.ngo;

  const sql = `SELECT ta.id, ta.task_id, ta.status AS assignment_status, ta.remarks,
                      t.title, t.description, t.location, t.resources_required, t.status AS task_status
               FROM task_assignments ta
               JOIN tasks t ON ta.task_id = t.task_id
               WHERE ta.ngo_username = ?
               ORDER BY ta.id DESC`;
  db.query(sql, [ngoUsername], (err, results) => {
    if (err) {
      console.error("Fetch assigned tasks error:", err);
      return res.json([]);
    }
    res.json(results);
  });
});

// PUT /update-assignment/:id
// Body: { status, remarks }
// Updates the status and remarks for an assignment
app.put("/update-assignment/:id", (req, res) => {
  const assignmentId = req.params.id;
  const { status, remarks } = req.body;

  if (!status) {
    return res.json({ success: false, message: "Status is required." });
  }

  const sql = "UPDATE task_assignments SET status = ?, remarks = ? WHERE id = ?";
  db.query(sql, [status, remarks || "", assignmentId], (err, result) => {
    if (err) {
      console.error("Update assignment error:", err);
      return res.json({ success: false, message: "Failed to update assignment." });
    }

    // Also update the parent task status
    // First get the task_id from the assignment
    const getTaskSql = "SELECT task_id FROM task_assignments WHERE id = ?";
    db.query(getTaskSql, [assignmentId], (err2, rows) => {
      if (!err2 && rows.length > 0) {
        const updateTaskSql = "UPDATE tasks SET status = ? WHERE task_id = ?";
        db.query(updateTaskSql, [status, rows[0].task_id]);
      }
    });

    res.json({ success: true, message: "Assignment updated successfully!" });
  });
});

// ------------------------------------------
// 4. CITIZEN APIs
// ------------------------------------------

// GET /public-tasks
// Returns all tasks for citizens to view (read-only)
app.get("/public-tasks", (req, res) => {
  const sql = `SELECT t.task_id, t.title, t.description, t.location, 
                      t.resources_required, t.status,
                      ta.ngo_username, ta.remarks
               FROM tasks t
               LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
               ORDER BY t.task_id DESC`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Fetch public tasks error:", err);
      return res.json([]);
    }
    res.json(results);
  });
});



// REGISTER USER
app.post("/register", (req, res) => {
  const { username, full_name, phone, email, password, role, organization, address } = req.body;

  // Basic validation
  if (!username || !password || !role) {
    return res.json({ success: false, message: "Missing required fields" });
  }

  // Insert into DB
  const sql = `
    INSERT INTO users 
    (username, full_name, phone, email, password, role, organization, address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [username, full_name, phone, email, password, role, organization, address], (err, result) => {
    if (err) {
      console.log(err);
      return res.json({ success: false, message: "User already exists or DB error" });
    }

    res.json({ success: true, message: "Registration successful" });
  });
});


// ======================

app.get("/help-requests", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM help_requests ORDER BY created_at DESC"
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Error fetching help requests" });
  }
});

// ------------------------------------------
// Start the server
// ------------------------------------------
app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`📂 Open http://localhost:${PORT}/login.html in your browser\n`);
});

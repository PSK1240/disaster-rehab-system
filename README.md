# 🛡️ Post-Disaster Rehabilitation Coordination System

A full-stack web application to coordinate disaster relief efforts between **Government**, **NGOs**, and **Citizens**.

## Tech Stack
- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Backend:** Node.js + Express
- **Database:** MySQL (mysql2)

---

## 📁 Folder Structure

```
post-disaster-rehab/
├── server.js          # Express backend server
├── setup.sql          # SQL script to create database & tables
├── package.json
├── public/
│   ├── login.html     # Login page
│   ├── gov.html       # Government dashboard
│   ├── ngo.html       # NGO dashboard
│   ├── citizen.html   # Citizen portal (read-only)
│   ├── css/
│   │   └── style.css  # Global stylesheet
│   └── js/
│       ├── login.js   # Login logic
│       ├── gov.js     # Government logic
│       └── ngo.js     # NGO logic
```

---

## 🚀 Step-by-Step Setup

### Step 1: Install Node.js
Download from [https://nodejs.org](https://nodejs.org) (LTS version).

### Step 2: Install MySQL
Download from [https://dev.mysql.com/downloads/](https://dev.mysql.com/downloads/) or use XAMPP/WAMP.

### Step 3: Create the Database
Open MySQL command line or MySQL Workbench and run:
```sql
source C:/path/to/post-disaster-rehab/setup.sql;
```
Or copy-paste the contents of `setup.sql` into your MySQL client.

### Step 4: Configure Database Connection
Open `server.js` and update the MySQL connection settings (lines 23-27):
```js
const db = mysql.createConnection({
  host: "localhost",
  user: "root",           // your MySQL username
  password: "",            // your MySQL password
  database: "disaster_rehab",
});
```

### Step 5: Install Dependencies
```bash
cd post-disaster-rehab
npm install
```

### Step 6: Start the Server
```bash
npm start
```

### Step 7: Open in Browser
Go to: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Test Credentials

| Role       | Username    | Password    |
|------------|-------------|-------------|
| Government | `admin`     | `admin123`  |
| NGO        | `ngo_hope`  | `hope123`   |
| NGO        | `ngo_relief`| `relief123` |
| Citizen    | `citizen1`  | `citizen123`|

---

## 📡 API Reference

| Method | Endpoint                 | Description                  |
|--------|--------------------------|------------------------------|
| POST   | `/login`                 | Authenticate a user          |
| POST   | `/create-task`           | Create a new task (Gov)      |
| GET    | `/tasks`                 | Get all tasks                |
| POST   | `/assign-task`           | Assign task to NGO (Gov)     |
| GET    | `/ngo-list`              | Get all NGO usernames        |
| GET    | `/assigned-tasks/:ngo`   | Get tasks for an NGO         |
| PUT    | `/update-assignment/:id` | Update assignment status     |
| GET    | `/public-tasks`          | Get all tasks (Citizen view) |

---

## 📋 Database Tables

### users
| Column   | Type         | Description        |
|----------|--------------|--------------------|
| id       | INT (PK)     | Auto-increment ID  |
| username | VARCHAR(50)  | Unique username    |
| phone    | VARCHAR(15)  | Phone number       |
| password | VARCHAR(100) | User password      |
| role     | ENUM         | citizen/ngo/government |

### tasks
| Column             | Type         | Description        |
|--------------------|--------------|--------------------|
| task_id            | INT (PK)     | Auto-increment ID  |
| title              | VARCHAR(200) | Task title         |
| description        | TEXT         | Task details       |
| location           | VARCHAR(200) | Task location      |
| resources_required | TEXT         | Required resources |
| status             | VARCHAR(50)  | pending/assigned/completed |

### task_assignments
| Column       | Type        | Description          |
|-------------|-------------|----------------------|
| id          | INT (PK)    | Auto-increment ID    |
| task_id     | INT (FK)    | References tasks     |
| ngo_username| VARCHAR(50) | Assigned NGO         |
| status      | VARCHAR(50) | assigned/in-progress/completed |
| remarks     | TEXT        | Progress notes       |

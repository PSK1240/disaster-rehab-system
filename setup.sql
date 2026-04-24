-- ============================================
-- Post-Disaster Rehabilitation Coordination System
-- Complete Database Setup Script
-- ============================================

CREATE DATABASE IF NOT EXISTS disaster_rehab;
USE disaster_rehab;

-- Users Table (all roles: citizen, ngo, government)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  full_name VARCHAR(100) NOT NULL DEFAULT '',
  phone VARCHAR(15),
  email VARCHAR(100),
  password VARCHAR(100) NOT NULL,
  role ENUM('citizen', 'ngo', 'government') NOT NULL,
  organization VARCHAR(200) DEFAULT '',
  address VARCHAR(300) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks Table (created by government)
CREATE TABLE IF NOT EXISTS tasks (
  task_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  location VARCHAR(200),
  disaster_type VARCHAR(100) DEFAULT 'General',
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  resources_required TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_from_request INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task Assignments (links tasks to NGOs)
CREATE TABLE IF NOT EXISTS task_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  ngo_username VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'assigned',
  remarks TEXT,
  progress_percent INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
);

-- Citizen Help Requests (citizens submit these)
CREATE TABLE IF NOT EXISTS help_requests (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  citizen_username VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(200) NOT NULL,
  disaster_type VARCHAR(100) DEFAULT 'General',
  urgency ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  people_affected INT DEFAULT 1,
  contact_phone VARCHAR(15),
  status VARCHAR(50) DEFAULT 'submitted',
  admin_remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Notifications (system-wide notifications)
CREATE TABLE IF NOT EXISTS notifications (
  notif_id INT AUTO_INCREMENT PRIMARY KEY,
  target_username VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(30) DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NGO Activity Reports
CREATE TABLE IF NOT EXISTS ngo_reports (
  report_id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  ngo_username VARCHAR(50) NOT NULL,
  report_text TEXT NOT NULL,
  resources_used TEXT,
  people_helped INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assignment_id) REFERENCES task_assignments(id) ON DELETE CASCADE
);

-- Sample Users (only insert if not already present)
INSERT IGNORE INTO users (username, full_name, phone, email, password, role, organization, address) VALUES
  ('admin','Admin Officer','9876543210','admin@gov.in','admin123','government','District Administration','Block A, Government Complex'),
  ('ngo_hope','Hope Foundation','9123456780','hope@ngo.org','hope123','ngo','Hope Relief Foundation','12, Charity Lane, City Center'),
  ('ngo_relief','Relief Corps','9123456781','relief@ngo.org','relief123','ngo','National Relief Corps','45, Service Road, North Block'),
  ('citizen1','Rahul Sharma','9000000001','rahul@email.com','citizen123','citizen','','Village B, North Region');

-- Sample Tasks
INSERT IGNORE INTO tasks (task_id, title, description, location, disaster_type, priority, resources_required, status) VALUES
  (1, 'Flood Relief - Zone A','Distribute food and water to flood-affected families.','Zone A, River District','Flood','high','Food, Water, First-aid','pending'),
  (2, 'Earthquake Shelter Setup','Set up temporary shelters for displaced families.','Block 5, Central City','Earthquake','critical','Tents, Blankets, Generators','pending'),
  (3, 'Medical Camp - Village B','Organize a free medical camp for injured residents.','Village B, North Region','Flood','high','Medicines, Doctors, Ambulances','assigned');

-- Sample Assignment
INSERT IGNORE INTO task_assignments (id, task_id, ngo_username, status, remarks, progress_percent) VALUES
  (1, 3, 'ngo_hope', 'in-progress', 'Medical team deployed. Camp operational since morning.', 60);

-- Sample Help Request
INSERT IGNORE INTO help_requests (request_id, citizen_username, title, description, location, disaster_type, urgency, people_affected, contact_phone, status) VALUES
  (1, 'citizen1', 'Need drinking water urgently', 'Our village has been cut off due to flooding. 50+ families need clean drinking water and food supplies immediately.', 'Village B, North Region', 'Flood', 'critical', 50, '9000000001', 'submitted');

-- Sample Notification
INSERT IGNORE INTO notifications (notif_id, target_username, message, type) VALUES
  (1, 'citizen1', 'Welcome to the Disaster Rehab Portal! You can submit help requests from your dashboard.', 'info'),
  (2, 'ngo_hope', 'You have been assigned a new task: Medical Camp - Village B', 'task');

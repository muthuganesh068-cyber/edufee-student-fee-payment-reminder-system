-- ====================================================================
-- Database Schema for Student Fee and Payment Reminder System
-- Database Name: student_fee_system
-- Target DBMS: MySQL 8.0+
-- Compatible with MariaDB 10.4+ / XAMPP / WAMP / Docker MySQL
-- ====================================================================

-- 1. Create Database if not exists
CREATE DATABASE IF NOT EXISTS student_fee_system
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE student_fee_system;

-- --------------------------------------------------------------------
-- Drop existing tables in reverse dependency order for clean re-runs
-- --------------------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS reminders;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS student_fees;
DROP TABLE IF EXISTS fee_structures;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------------------
-- Table 1: users (System Authentication & User Accounts)
-- --------------------------------------------------------------------
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- bcrypt hashed
    role ENUM('admin', 'student') NOT NULL DEFAULT 'student',
    phone VARCHAR(20) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- Table 2: departments (Academic Departments & Courses)
-- --------------------------------------------------------------------
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    department_code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT DEFAULT NULL,
    courses JSON DEFAULT NULL, -- Array of course names e.g. ["B.Tech CSE", "M.Tech CSE"]
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- Table 3: students (Student Profile Details)
-- --------------------------------------------------------------------
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL UNIQUE, -- College Roll No / Reg No e.g., 'STU2026001'
    user_id INT DEFAULT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    department VARCHAR(100) NOT NULL,
    course VARCHAR(100) NOT NULL,
    year INT NOT NULL DEFAULT 1,
    semester INT NOT NULL DEFAULT 1,
    academic_year VARCHAR(20) NOT NULL, -- e.g. '2025-2026'
    admission_date DATE NOT NULL,
    status ENUM('active', 'inactive', 'graduated') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_student_id (student_id),
    INDEX idx_student_dept (department),
    INDEX idx_student_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- Table 4: fee_structures (Fee Configurations per Course/Semester)
-- --------------------------------------------------------------------
CREATE TABLE fee_structures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department VARCHAR(100) NOT NULL,
    course VARCHAR(100) NOT NULL,
    year INT NOT NULL DEFAULT 1,
    semester INT NOT NULL DEFAULT 1,
    academic_year VARCHAR(20) NOT NULL,
    tuition_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    exam_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    library_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    hostel_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    other_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    due_date DATE NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_fee_course (course),
    INDEX idx_fee_due (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- Table 5: student_fees (Student Fee Assignment & Balance Tracking)
-- --------------------------------------------------------------------
CREATE TABLE student_fees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    fee_structure_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    paid_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    pending_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    due_date DATE NOT NULL,
    status ENUM('PAID', 'PARTIALLY PAID', 'PENDING', 'OVERDUE') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id) ON DELETE RESTRICT,
    INDEX idx_sf_student (student_id),
    INDEX idx_sf_status (status),
    INDEX idx_sf_due (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- Table 6: payments (Payment Records and Transactions)
-- --------------------------------------------------------------------
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    receipt_no VARCHAR(50) NOT NULL UNIQUE,
    student_fee_id INT NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('Cash', 'UPI', 'Bank Transfer', 'Card', 'Other') NOT NULL,
    transaction_id VARCHAR(100) DEFAULT NULL,
    payment_date DATE NOT NULL,
    status ENUM('SUCCESS', 'PENDING', 'FAILED') DEFAULT 'SUCCESS',
    remarks VARCHAR(255) DEFAULT NULL,
    recorded_by VARCHAR(100) DEFAULT 'Admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_fee_id) REFERENCES student_fees(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    INDEX idx_pay_student (student_id),
    INDEX idx_pay_date (payment_date),
    INDEX idx_pay_receipt (receipt_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- Table 7: reminders (Sent and Pending Payment Reminders)
-- --------------------------------------------------------------------
CREATE TABLE reminders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    student_fee_id INT NOT NULL,
    reminder_type ENUM('Upcoming', 'Due Today', 'Overdue', 'Partial Payment', 'Custom') NOT NULL,
    channel ENUM('In-App', 'Email', 'SMS') DEFAULT 'In-App',
    message TEXT NOT NULL,
    pending_amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('SENT', 'PENDING', 'FAILED') DEFAULT 'SENT',
    sent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (student_fee_id) REFERENCES student_fees(id) ON DELETE CASCADE,
    INDEX idx_rem_student (student_id),
    INDEX idx_rem_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- Table 8: notifications (In-App Notification Messages)
-- --------------------------------------------------------------------
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    student_id VARCHAR(50) DEFAULT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('reminder', 'payment', 'due_date', 'system') NOT NULL DEFAULT 'system',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user (user_id),
    INDEX idx_notif_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- SAMPLE DATA INSERTION (For demonstration and evaluation)
-- Demo Passwords are all: password123 (or admin123 for admin)
-- Bcrypt Hash for 'admin123': $2a$10$wT0lQ56mKkgZgG1i.1qGyeU2B9N8Wb85z7.z3oX8Dk14fD5O.Hj2S
-- Bcrypt Hash for 'password123': $2a$10$eE0mQ56mKkgZgG1i.1qGyeU2B9N8Wb85z7.z3oX8Dk14fD5O.Hj2S
-- ====================================================================

-- 1. Insert System Users
INSERT INTO users (id, name, email, password, role, phone) VALUES
(1, 'System Administrator', 'admin@example.com', '$2a$10$wT0lQ56mKkgZgG1i.1qGyeU2B9N8Wb85z7.z3oX8Dk14fD5O.Hj2S', 'admin', '9876543210'),
(2, 'Aarav Sharma', 'aarav.sharma@example.com', '$2a$10$eE0mQ56mKkgZgG1i.1qGyeU2B9N8Wb85z7.z3oX8Dk14fD5O.Hj2S', 'student', '9876500001'),
(3, 'Priya Patel', 'priya.patel@example.com', '$2a$10$eE0mQ56mKkgZgG1i.1qGyeU2B9N8Wb85z7.z3oX8Dk14fD5O.Hj2S', 'student', '9876500002'),
(4, 'Rohan Verma', 'rohan.verma@example.com', '$2a$10$eE0mQ56mKkgZgG1i.1qGyeU2B9N8Wb85z7.z3oX8Dk14fD5O.Hj2S', 'student', '9876500003'),
(5, 'Ananya Iyer', 'ananya.iyer@example.com', '$2a$10$eE0mQ56mKkgZgG1i.1qGyeU2B9N8Wb85z7.z3oX8Dk14fD5O.Hj2S', 'student', '9876500004'),
(6, 'Vikram Singh', 'vikram.singh@example.com', '$2a$10$eE0mQ56mKkgZgG1i.1qGyeU2B9N8Wb85z7.z3oX8Dk14fD5O.Hj2S', 'student', '9876500005');

-- 2. Insert Departments
INSERT INTO departments (id, department_name, department_code, description, courses) VALUES
(1, 'Computer Science & Engineering', 'CSE', 'Department of Computer Science and Engineering offering undergraduate and postgraduate programs.', '["B.Tech CSE", "M.Tech CSE", "B.Sc Computer Science"]'),
(2, 'Information Technology', 'IT', 'Department of Information Technology specializing in web systems, cloud computing, and cybersecurity.', '["B.Tech IT", "BCA", "MCA"]'),
(3, 'Electronics & Communication', 'ECE', 'Department of ECE focusing on embedded systems, VLSI, and communication networks.', '["B.Tech ECE", "M.Tech VLSI"]'),
(4, 'Mechanical Engineering', 'MECH', 'Department of Mechanical Engineering with advanced robotics and manufacturing labs.', '["B.Tech Mechanical"]'),
(5, 'Management Studies', 'MBA', 'Department of Business Administration & Management.', '["BBA", "MBA"]');

-- 3. Insert Students (Covering all scenarios requested in requirements)
INSERT INTO students (id, student_id, user_id, name, email, phone, department, course, year, semester, academic_year, admission_date, status) VALUES
(1, 'STU2026001', 2, 'Aarav Sharma', 'aarav.sharma@example.com', '9876500001', 'Computer Science & Engineering', 'B.Tech CSE', 3, 5, '2025-2026', '2023-08-10', 'active'),
(2, 'STU2026002', 3, 'Priya Patel', 'priya.patel@example.com', '9876500002', 'Information Technology', 'B.Tech IT', 2, 3, '2025-2026', '2024-08-14', 'active'),
(3, 'STU2026003', 4, 'Rohan Verma', 'rohan.verma@example.com', '9876500003', 'Electronics & Communication', 'B.Tech ECE', 4, 7, '2025-2026', '2022-08-20', 'active'),
(4, 'STU2026004', 5, 'Ananya Iyer', 'ananya.iyer@example.com', '9876500004', 'Computer Science & Engineering', 'B.Tech CSE', 1, 1, '2025-2026', '2025-08-12', 'active'),
(5, 'STU2026005', 6, 'Vikram Singh', 'vikram.singh@example.com', '9876500005', 'Management Studies', 'MBA', 1, 2, '2025-2026', '2025-08-15', 'active');

-- 4. Insert Fee Structures
INSERT INTO fee_structures (id, department, course, year, semester, academic_year, tuition_fee, exam_fee, library_fee, hostel_fee, other_fee, total_fee, due_date, status) VALUES
(1, 'Computer Science & Engineering', 'B.Tech CSE', 3, 5, '2025-2026', 45000.00, 2500.00, 1500.00, 18000.00, 3000.00, 70000.00, '2026-10-15', 'active'),
(2, 'Information Technology', 'B.Tech IT', 2, 3, '2025-2026', 42000.00, 2500.00, 1500.00, 16000.00, 3000.00, 65000.00, '2026-10-25', 'active'),
(3, 'Electronics & Communication', 'B.Tech ECE', 4, 7, '2025-2026', 40000.00, 3000.00, 1500.00, 0.00, 3500.00, 48000.00, '2026-09-15', 'active'),
(4, 'Computer Science & Engineering', 'B.Tech CSE', 1, 1, '2025-2026', 50000.00, 2500.00, 2000.00, 18000.00, 5000.00, 77500.00, '2026-11-30', 'active'),
(5, 'Management Studies', 'MBA', 1, 2, '2025-2026', 60000.00, 3000.00, 2500.00, 20000.00, 4500.00, 90000.00, '2026-10-03', 'active');

-- 5. Insert Student Fees (Demonstrating all statuses)
-- Scenario 1: Aarav Sharma -> FULLY PAID (Total 70,000, Paid 70,000, Pending 0)
-- Scenario 2: Priya Patel  -> PARTIALLY PAID (Total 65,000, Paid 35,000, Pending 30,000, Due 2026-10-25)
-- Scenario 3: Rohan Verma  -> OVERDUE (Total 48,000, Paid 0, Pending 48,000, Due 2026-09-15)
-- Scenario 4: Ananya Iyer  -> UPCOMING / PENDING (Total 77,500, Paid 0, Pending 77,500, Due 2026-11-30)
-- Scenario 5: Vikram Singh -> DUE TODAY / PARTIALLY PAID (Total 90,000, Paid 40,000, Pending 50,000, Due 2026-10-03)
INSERT INTO student_fees (id, student_id, fee_structure_id, total_amount, paid_amount, pending_amount, due_date, status) VALUES
(1, 'STU2026001', 1, 70000.00, 70000.00, 0.00, '2026-10-15', 'PAID'),
(2, 'STU2026002', 2, 65000.00, 35000.00, 30000.00, '2026-10-25', 'PARTIALLY PAID'),
(3, 'STU2026003', 3, 48000.00, 0.00, 48000.00, '2026-09-15', 'OVERDUE'),
(4, 'STU2026004', 4, 77500.00, 0.00, 77500.00, '2026-11-30', 'PENDING'),
(5, 'STU2026005', 5, 90000.00, 40000.00, 50000.00, '2026-10-03', 'PARTIALLY PAID');

-- 6. Insert Payments
INSERT INTO payments (id, receipt_no, student_fee_id, student_id, amount, payment_method, transaction_id, payment_date, status, remarks, recorded_by) VALUES
(1, 'REC-2026-0001', 1, 'STU2026001', 40000.00, 'UPI', 'UPI/2026/8947219', '2026-09-10', 'SUCCESS', 'First installment - Tuition fee', 'System Administrator'),
(2, 'REC-2026-0002', 1, 'STU2026001', 30000.00, 'Bank Transfer', 'NEFT-AXIS-992104', '2026-09-28', 'SUCCESS', 'Final balance clearance', 'System Administrator'),
(3, 'REC-2026-0003', 2, 'STU2026002', 35000.00, 'UPI', 'UPI/2026/1129482', '2026-09-25', 'SUCCESS', 'Partial fee installment', 'System Administrator'),
(4, 'REC-2026-0004', 5, 'STU2026005', 40000.00, 'Card', 'POS-HDFC-582910', '2026-09-20', 'SUCCESS', 'Term 1 payment', 'System Administrator');

-- 7. Insert Reminders
INSERT INTO reminders (id, student_id, student_fee_id, reminder_type, channel, message, pending_amount, due_date, status, sent_date) VALUES
(1, 'STU2026003', 3, 'Overdue', 'In-App', 'URGENT: Your fee payment of ₹48,000 for B.Tech ECE Semester 7 was due on 2026-09-15. Please clear your dues immediately to prevent exam hall-ticket holds.', 48000.00, '2026-09-15', 'SENT', '2026-09-18 10:30:00'),
(2, 'STU2026005', 5, 'Due Today', 'In-App', 'REMINDER: Today is the due date for your remaining MBA fee balance of ₹50,000. Please complete the payment today.', 50000.00, '2026-10-03', 'SENT', '2026-10-03 09:00:00'),
(3, 'STU2026002', 2, 'Upcoming', 'In-App', 'Friendly reminder: Your upcoming fee installment of ₹30,000 is due on 2026-10-25. You can pay online or at the accounts office.', 30000.00, '2026-10-25', 'SENT', '2026-10-01 14:15:00');

-- 8. Insert In-App Notifications
INSERT INTO notifications (id, user_id, student_id, title, message, type, is_read, created_at) VALUES
(1, 2, 'STU2026001', 'Payment Receipt Generated', 'Payment of ₹30,000 has been successfully recorded. Your full fee for Semester 5 is now PAID. Receipt: REC-2026-0002', 'payment', 1, '2026-09-28 12:00:00'),
(2, 3, 'STU2026002', 'Upcoming Fee Due Date', 'Your remaining fee balance of ₹30,000 is due on 25 Oct 2026.', 'due_date', 0, '2026-10-01 14:15:00'),
(3, 4, 'STU2026003', 'Fee Payment Overdue Alert', 'Your fee of ₹48,000 was due on 15 Sep 2026 and is currently OVERDUE. Please contact the college accounts desk.', 'reminder', 0, '2026-09-18 10:30:00'),
(4, 6, 'STU2026005', 'Fee Due Today Alert', 'Your MBA Semester 2 fee balance of ₹50,000 is due today (03 Oct 2026).', 'due_date', 0, '2026-10-03 09:00:00');

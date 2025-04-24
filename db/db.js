const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Create the database if not exists
db.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`, (err) => {
  if (err) {
    console.error("Error creating database:", err);
    throw err;
  }
  console.log("Database is ready");

  const adminTable = `
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      photo VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

  db.query(adminTable, (err) => {
    if (err) {
      console.error("Error creating 'admins' table:", err);
      throw err;
    }
    console.log("Admins table is ready");
  });

  const gradesTable = `
      CREATE TABLE IF NOT EXISTS grades (
        id INT AUTO_INCREMENT PRIMARY KEY,
        grade_name VARCHAR(50) UNIQUE NOT NULL
      )`;

  db.query(gradesTable, (err) => {
    if (err) {
      console.error("Error creating 'grades' table:", err);
      throw err;
    }
    console.log("Grades table is ready");
  });
  //
  // Pre-loading grades into the Grades Tablee
  db.query(
    `INSERT IGNORE INTO grades (grade_name) VALUES 
      ('A'), ('B'), ('C'), ('D'), ('F')`
  );

  const studentTable = `
    CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    age TINYINT UNSIGNED,
    grade_id INT,
    photo VARCHAR(255),
    admin_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
    FOREIGN KEY (grade_id) REFERENCES grades(id) ON DELETE SET NULL
    )`;

  db.query(studentTable, (err) => {
    if (err) {
      console.error("Error creating 'students' table:", err);
      throw err;
    }
    console.log("Students table is ready");
  });
  db.query("CREATE INDEX idx_admin_id ON students(admin_id);");
  db.query("CREATE INDEX idx_grade_id ON students(grade_id);");
});

module.exports = db;

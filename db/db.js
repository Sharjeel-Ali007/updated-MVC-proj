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
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      photo VARCHAR(255)
    )`;

  db.query(adminTable, (err) => {
    if (err) {
      console.error("Error creating 'admins' table:", err);
      throw err;
    }
    console.log("Admins table is ready");
  });

  const studentTable = `
    CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    age VARCHAR(255),
    grade VARCHAR(50),
    photo VARCHAR(255),
    admin_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`;

  db.query(studentTable, (err) => {
    if (err) {
      console.error("Error creating 'students' table:", err);
      throw err;
    }
    console.log("Students table is ready");
  });
});

module.exports = db;

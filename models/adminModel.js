const db = require("../db/db");

const Admin = {
  create: (name, email, password, photo, callback) => {
    db.query(
      "INSERT INTO admins (name, email, password, photo) VALUES (?, ?, ?, ?)",
      [name, email, password, photo],
      callback
    );
  },

  findByEmail: (email, callback) => {
    db.query("SELECT * FROM admins WHERE email = ?", [email], callback);
  },

  getAll: (callback) => {
    db.query("SELECT * FROM admins", callback);
  },
};

module.exports = Admin;

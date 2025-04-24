const db = require("../db/db");

const Admin = {
  create: (name, email, password, photo, callback) => {
    const query = `
      INSERT INTO admins (name, email, password, photo)
      VALUES (?, ?, ?, ?)`;
    db.query(query, [name, email, password, photo], callback);
  },

  findByEmail: (email, callback) => {
    db.query("SELECT * FROM admins WHERE email = ?", [email], callback);
  },

  getAll: (callback) => {
    db.query("SELECT id, name, email, photo FROM admins", callback);
  },
};

module.exports = Admin;

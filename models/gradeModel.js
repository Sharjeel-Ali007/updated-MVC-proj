const db = require("../db/db");

const Grade = {
  getAll: (callback) => {
    db.query("SELECT * FROM grades", callback);
  },
  getByName: (grade_name, callback) => {
    db.query(
      "SELECT * FROM grades WHERE grade_name = ?",
      [grade_name],
      callback
    );
  },
};

module.exports = Grade;

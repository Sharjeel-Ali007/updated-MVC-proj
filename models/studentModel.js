const db = require("../db/db");

const Student = {
  getAll: (callback) => {
    db.query("SELECT * FROM students", (err, result) => {
      if (err) {
        console.error("Error fetching students:", err);
        return callback(err);
      }
      callback(null, result);
    });
  },

  getById: (id, callback) => {
    db.query("SELECT * FROM students WHERE id = ?", [id], (err, result) => {
      if (err) {
        console.error("Error fetching student:", err);
        return callback(err);
      }
      if (result.length === 0) {
        return callback(null, null);
      }
      callback(null, result[0]);
    });
  },

  //
  //
  create: (name, age, grade, email, photo, adminId, callback) => {
    if (!name || !photo || !adminId) {
      return callback(
        new Error("Name, photo, and adminId are required fields")
      );
    }

    const query =
      "INSERT INTO students (name, age, grade, email, photo, admin_id) VALUES (?, ?, ?, ?, ?, ?)";
    const values = [name, age, grade, email, photo, adminId];

    console.log("Executing query:", query, "with values:", values);

    db.query(query, values, (err, result) => {
      if (err) {
        console.error("Database error while inserting student:", err);
        return callback(err);
      }
      callback(null, { id: result.insertId, name });
    });
  },

  update: (id, name, email, age, grade, photo, callback) => {
    const query = `
      UPDATE students 
      SET name = ?, email = ?, age = ?, grade = ?, photo = ?
      WHERE id = ?`;
    const values = [name, email, age, grade, photo, id];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error("Error updating student:", err);
        return callback(err);
      }
      if (result.affectedRows === 0) {
        return callback(new Error("Student not found"));
      }
      callback(null, { id, name, email, age, grade, photo });
    });
  },
  delete: (id, callback) => {
    const query = "DELETE FROM students WHERE id = ?";
    db.query(query, [id], (err, result) => {
      if (err) {
        console.error("Error deleting student:", err);
        return callback(err);
      }
      if (result.affectedRows === 0) {
        return callback(new Error("Student not found"));
      }
      callback(null, { id });
    });
  },
};

module.exports = Student;

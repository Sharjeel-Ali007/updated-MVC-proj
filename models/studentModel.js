const db = require("../db/db");

const Student = {
  getAll: (page = 1, limit = 10, callback) => {
    const offset = (page - 1) * limit;
    const query = `
    SELECT students.name, students.email, students.age, grades.grade_name AS grade
    FROM students
    LEFT JOIN grades ON students.grade_id = grades.id
    LIMIT ? OFFSET ?`;
    db.query(query, [parseInt(limit), parseInt(offset)], callback);
  },

  getById: (id, callback) => {
    const query = `
      SELECT students.*, grades.grade_name AS grade
      FROM students
      LEFT JOIN grades ON students.grade_id = grades.id
      WHERE students.id = ?`;
    db.query(query, [id], callback);
  },

  create: (name, age, gradeId, email, photo, adminId, callback) => {
    const query = `
      INSERT INTO students (name, age, grade_id, email, photo, admin_id)
      VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [name, age, gradeId, email, photo, adminId];
    db.query(query, values, (err, result) => {
      if (err) return callback(err);
      callback(null, { id: result.insertId, name });
    });
  },

  update: (id, name, email, age, gradeId, photo, callback) => {
    const query = `
      UPDATE students
      SET name = ?, email = ?, age = ?, grade_id = ?, photo = ?
      WHERE id = ?`;
    const values = [name, email, age, gradeId, photo, id];
    db.query(query, values, (err, result) => {
      if (err) return callback(err);
      callback(null, { id, name, email, age });
    });
  },

  delete: (id, callback) => {
    db.query("DELETE FROM students WHERE id = ?", [id], callback);
  },
};

module.exports = Student;

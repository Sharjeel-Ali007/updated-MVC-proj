const Student = require("../models/studentModel");

exports.getAllStudents = (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).send("Only admins can access all students");

  Student.getAll((err, result) => {
    if (err) return res.status(500).send("Error fetching students");
    res.send(result);
  });
};

exports.getStudentById = (req, res) => {
  Student.getById(req.params.id, (err, student) => {
    if (err) return res.status(500).send("Error fetching student");
    if (!student) return res.status(404).send("Student not found");

    // Role-based access control
    if (
      req.user.role === "student" &&
      req.user.id !== parseInt(req.params.id)
    ) {
      return res.status(403).send("Access denied");
    }

    res.send(student);
  });
};

exports.createStudent = (req, res) => {
  const { name, age, grade, email } = req.body;
  const photo = req.file ? req.file.path.replace(/\\/g, "/") : null;
  const adminId = req.user.role === "admin" ? req.user.id : null;

  if (!name) {
    return res.status(400).send("Name is required");
  }

  if (age && isNaN(age)) {
    return res.status(400).send("Age must be a valid number");
  }

  if (!grade) {
    return res.status(400).send("Grade is required");
  }

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (email && !emailRegex.test(email)) {
    return res.status(400).send("Invalid email format");
  }

  if (photo && typeof photo !== "string") {
    return res.status(400).send("Invalid photo path");
  }

  if (adminId && typeof adminId !== "number") {
    return res.status(400).send("Invalid admin ID");
  }

  console.log("Received data:", { name, age, grade, email, photo, adminId });

  Student.create(name, age, grade, email, photo, adminId, (err, result) => {
    if (err) {
      console.error("Error creating student:", err);
      return res.status(500).send("Error creating student");
    }
    console.log("Student created:", result);
    res.send({ id: result.insertId, name });
  });
};

exports.updateStudent = (req, res) => {
  const { name, email, grade, age } = req.body;
  const photo = req.file ? req.file.path.replace(/\\/g, "/") : null;

  if (!name || !email) {
    return res.status(400).send("Name and email are required");
  }

  Student.update(
    req.params.id,
    name,
    email,
    age,
    grade,
    photo,
    (err, result) => {
      if (err) return res.status(500).send("Error updating student");
      res.send(result);
    }
  );
};

exports.deleteStudent = (req, res) => {
  Student.delete(req.params.id, (err, result) => {
    if (err) return res.status(500).send("Error deleting student");
    if (result.affectedRows === 0)
      return res.status(404).send("Student not found");
    res.send("Student deleted");
  });
};

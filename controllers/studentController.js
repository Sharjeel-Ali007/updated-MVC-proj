const Student = require("../models/studentModel");
const Grade = require("../models/gradeModel");
const redisClient = require("../redis/redisClient");

exports.getAllStudents = async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).send("Only admins can access all students");

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const cacheKey = `all_students_page_${page}_limit_${limit}`;

  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log("Serving from Redis cache");
      return res.send(JSON.parse(cachedData));
    }

    Student.getAll(page, limit, async (err, result) => {
      if (err) return res.status(500).send("Error fetching students");
      // cache for 60s
      await redisClient.setEx(cacheKey, 60, JSON.stringify(result));
      res.send(result);
    });
  } catch (err) {
    console.error("Redis error:", err);
    res.status(500).send("Server error with Redis");
  }
};

exports.getStudentById = (req, res) => {
  Student.getById(req.params.id, (err, studentData) => {
    if (err) return res.status(500).send("Error fetching student");
    if (!studentData.length) return res.status(404).send("Student not found");

    const student = studentData[0];
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

  if (!name || !grade)
    return res.status(400).send("Name and grade are required");

  Grade.getByName(grade, (err, gradeData) => {
    if (err || gradeData.length === 0)
      return res.status(400).send("Invalid grade");

    const gradeId = gradeData[0].id;

    Student.create(
      name,
      age,
      gradeId,
      email,
      photo,
      adminId,
      async (err, result) => {
        if (err) return res.status(500).send("Error creating student");
        // clear cache
        await redisClient.flushAll();
        res.send(result);
      }
    );
  });
};

exports.updateStudent = (req, res) => {
  const { name, email, grade, age } = req.body;
  const photo = req.file ? req.file.path.replace(/\\/g, "/") : null;

  if (!name || !email || !grade) {
    return res.status(400).send("Name, email, and grade are required");
  }

  Grade.getByName(grade, (err, gradeData) => {
    if (err || gradeData.length === 0)
      return res.status(400).send("Invalid grade");

    const gradeId = gradeData[0].id;

    Student.update(
      req.params.id,
      name,
      email,
      age,
      gradeId,
      photo,
      async (err, result) => {
        if (err) return res.status(500).send("Error updating student");
        // clear cache
        await redisClient.flushAll();
        res.send(result);
      }
    );
  });
};

exports.deleteStudent = (req, res) => {
  Student.delete(req.params.id, async (err, result) => {
    if (err) return res.status(500).send("Error deleting student");
    // clear cache
    await redisClient.flushAll();
    res.send("Student deleted");
  });
};

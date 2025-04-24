const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");
require("dotenv").config();

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const photo = req.file ? req.file.path : null;

    const hashed = await bcrypt.hash(password, 10);

    Admin.create(name, email, hashed, photo, (err, result) => {
      if (err) return res.status(500).send("Error creating admin");
      res.send({ id: result.insertId, name, email });
    });
  } catch (err) {
    res.status(500).send("Unexpected server error");
  }
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  Admin.findByEmail(email, async (err, result) => {
    if (err) return res.status(500).send("Server error");
    if (result.length === 0) return res.status(400).send("Invalid credentials");

    const valid = await bcrypt.compare(password, result[0].password);
    if (!valid) return res.status(400).send("Invalid credentials");

    const token = jwt.sign(
      { id: result[0].id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.send({ token });
  });
};

exports.getAllAdmins = (req, res) => {
  Admin.getAll((err, result) => {
    if (err) return res.status(500).send("Error getting admins");
    res.send(result);
  });
};

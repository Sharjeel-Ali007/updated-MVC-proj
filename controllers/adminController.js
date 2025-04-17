//

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");
require("dotenv").config();

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const photo = req.file ? req.file.path : null;

    const hashed = await bcrypt.hash(password, 10);

    console.log("Admin Registration Data:", {
      name,
      email,
      hashedPassword: hashed,
      photo,
    });

    Admin.create(name, email, hashed, photo, (err, result) => {
      if (err) {
        console.error("DB Error while creating admin:", err);
        return res.status(500).send("Error creating admin");
      }
      console.log("Admin created with ID:", result.insertId);
      res.send({ id: result.insertId, name, email });
    });
  } catch (err) {
    console.error("Unexpected error in register:", err);
    res.status(500).send("Unexpected server error");
  }
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  Admin.findByEmail(email, async (err, result) => {
    if (err) {
      console.error("Error finding admin by email:", err);
      return res.status(500).send("Server error");
    }

    if (result.length === 0) {
      return res.status(400).send("Invalid credentials");
    }

    const valid = await bcrypt.compare(password, result[0].password);
    if (!valid) return res.status(400).send("Invalid credentials");

    const token = jwt.sign(
      { id: result[0].id, role: "admin" },
      process.env.JWT_SECRET
    );

    res.send({ token });
  });
};

exports.getAllAdmins = (req, res) => {
  Admin.getAll((err, result) => {
    if (err) {
      console.error("Error fetching all admins:", err);
      return res.status(500).send("Error getting admins");
    }
    res.send(result);
  });
};

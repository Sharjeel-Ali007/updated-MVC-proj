const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");
const redisClient = require("../redis/redisClient");
require("dotenv").config();

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const photo = req.file ? req.file.path : null;

    const hashed = await bcrypt.hash(password, 10);

    Admin.create(name, email, hashed, photo, async (err, result) => {
      if (err) return res.status(500).send("Error creating admin");

      await redisClient.flushAll(); // Clear cache on create
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

exports.getAllAdmins = async (req, res) => {
  const cacheKey = "all_admins";

  try {
    const cachedAdmins = await redisClient.get(cacheKey);
    if (cachedAdmins) {
      console.log("Showing admins from Redis cache");
      return res.send(JSON.parse(cachedAdmins));
    }

    Admin.getAll(async (err, result) => {
      if (err) return res.status(500).send("Error getting admins");

      //Get from redis
      await redisClient.setEx(cacheKey, 60, JSON.stringify(result));
      res.send(result);
    });
  } catch (err) {
    console.error("Redis error:", err);
    res.status(500).send("Server error with Redis");
  }
};

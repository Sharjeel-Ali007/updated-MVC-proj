require("dotenv").config();
const express = require("express");
const cors = require("cors");
const limiter = require("./middleware/rateLimiter");
const app = express();
const studentRoutes = require("./routes/studentRoutes");
const adminRoutes = require("./routes/adminRoutes");

//Apply rate limiter
app.use(limiter);

// CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.use("/students", studentRoutes);
app.use("/admins", adminRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});

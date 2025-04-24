require("dotenv").config();
const https = require("https");
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const limiter = require("./middleware/rateLimiter");
const studentRoutes = require("./routes/studentRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

//rate limiter
app.use(limiter);
app.use(express.json());

// CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Load SSL certificate and key
const privateKey = fs.readFileSync(
  path.join(__dirname, "ssl", "key.pem"),
  "utf8"
);
const certificate = fs.readFileSync(
  path.join(__dirname, "ssl", "cert.pem"),
  "utf8"
);

const credentials = { key: privateKey, cert: certificate };
//
//
//

app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("Hello world");
});

//Routes
app.use("/students", studentRoutes);
app.use("/admins", adminRoutes);

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);

// Run server
httpsServer.listen(process.env.PORT, () => {
  console.log(
    `HTTPS Server is running on https://localhost:${process.env.PORT}`
  );
});

// app.listen(process.env.PORT, () => {
//   console.log(`Server listening on port ${process.env.PORT}`);
// });

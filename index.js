require("dotenv").config();
const cluster = require("cluster");
const os = require("os");
const https = require("https");
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const limiter = require("./middleware/rateLimiter");
const studentRoutes = require("./routes/studentRoutes");
const adminRoutes = require("./routes/adminRoutes");

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`Master process ${process.pid} is running`);

  // form workers if the cluster is Master one
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Restart any worker that dies
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  const app = express();
  app.use(express.json());

  // Rate Limiter
  app.use(limiter);

  // CORS
  app.use(
    cors({
      origin: "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    })
  );

  // SSL
  const privateKey = fs.readFileSync(
    path.join(__dirname, "ssl", "key.pem"),
    "utf8"
  );
  const certificate = fs.readFileSync(
    path.join(__dirname, "ssl", "cert.pem"),
    "utf8"
  );
  const credentials = { key: privateKey, cert: certificate };

  // img handling
  app.use("/uploads", express.static("uploads"));

  // app.get("/", (req, res) => {
  //   res.send(`Hello from worker ${process.pid}`);
  // });

  // Routes
  app.use("/students", studentRoutes);
  app.use("/admins", adminRoutes);

  // HTTPS server
  const httpsServer = https.createServer(credentials, app);
  httpsServer.listen(process.env.PORT, () => {
    console.log(
      `Worker ${process.pid} running on https://localhost:${process.env.PORT}`
    );
  });
}

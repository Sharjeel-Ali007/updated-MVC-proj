const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  //if someone tries to make more than 100 requests in 15 minutes, they will be blocked for the rest of that period.
  message: "Too many requests from this IP. Please try again later.",
});

module.exports = limiter;

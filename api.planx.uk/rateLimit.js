const rateLimit = require("express-rate-limit")

// Broad limiter to prevent egregious abuse
const apiLimiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 10 minutes
	max: 250,
	standardHeaders: true,
	legacyHeaders: false,
});

// Limit the number of requests which can send a "Save & Return" email
const sendEmailLimiter = rateLimit({
	windowMs: 5 * 60 * 1000, // 10 minutes
	max: 25,
	standardHeaders: true,
	legacyHeaders: false,
  // Use email as key for limiter
  // Invalid emails will fail at validation
  keyGenerator: (request, response) => request.body?.payload?.email,
  // Only apply limiter to public requests - allow Hasura to make multiple requests without limit
  // Any other template requires authorization
  skip: (request, response) => request.params.template !== "save",
});

module.exports = { apiLimiter, sendEmailLimiter };
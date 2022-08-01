const rateLimit = require("express-rate-limit")

// Endpoints which rate limiting will not be applied to
const RATE_LIMIT_IGNORE_LIST = [
	"hasura/v1/graphql",
];

// Broad limiter to prevent egregious abuse
const apiLimiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 10 minutes
	max: 250,
	standardHeaders: true,
	legacyHeaders: false,
	skip: (req, _res) => RATE_LIMIT_IGNORE_LIST.includes(req.path),
});

const HASURA_ONLY_SEND_EMAIL_TEMPLATES = [
	"reminder",
	"expiry",
];

// Limit the number of requests which can send a "Save & Return" email
const sendEmailLimiter = rateLimit({
	windowMs: 5 * 60 * 1000, // 10 minutes
	max: 25,
	standardHeaders: true,
	legacyHeaders: false,
  // Use email as key for limiter
  // Invalid emails will fail at validation
  keyGenerator: (req, _res) => req.body?.payload?.email,
	// Only apply limiter to public requests - allow Hasura to make multiple requests without limit
	// Any other S&R endpoints require authorisation
  skip: (req, _res) => HASURA_ONLY_SEND_EMAIL_TEMPLATES.includes(req.params.template),
});

module.exports = { apiLimiter, sendEmailLimiter };
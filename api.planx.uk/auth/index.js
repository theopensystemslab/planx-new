const crypto = require('crypto');
const { singleSessionEmailTemplates } = require('../saveAndReturn/utils');

/**
 * Validate that a provided string (e.g. API key) matches the expected value
 * @param {string} provided 
 * @param {string} expected 
 * @returns {boolean}
 */
const isEqual = (provided = "", expected) => {
  return crypto.timingSafeEqual(
    Buffer.from(provided), 
    Buffer.from(expected)
  );
};

/**
 * Validate that a request is using the Hasura API key
 * @param {object} req 
 * @param {object} res 
 * @param {object} next 
 */
const useHasuraAuth = (req, res, next) => {
  const isAuthenticated = isEqual(req.headers.authorization, process.env.HASURA_PLANX_API_KEY);
  if (!isAuthenticated) return res.status(401).send("Unauthorised");
  next();
};

/**
 * Ensure that the correct permissions are used for the /send-email endpoint
 * @param {object} req
 * @param {object} res
 * @param {object} next
 */
const useSendEmailAuth = (req, res, next) => {
  switch (req.params.template) {
    case "reminder":
    case "expiry":
      // Requires authorization - can only be triggered by Hasura scheduled events
      return useHasuraAuth(req, res, next);
    case "save":
      // Public access
      return next();
    default:
      // Invalid template
      const validTemplates = Object.keys(singleSessionEmailTemplates);
      return next({
        status: 400,
        message: `Invalid template - must be one of [${validTemplates.join(', ')}]`
      });
  };
};

module.exports = { 
  useHasuraAuth, 
  useSendEmailAuth,
};

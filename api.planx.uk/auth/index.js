const crypto = require('crypto');

/**
 * Validate that a provided string (e.g. API key) matches the expected value
 * @param {string} provided 
 * @param {string} expected 
 * @returns {boolean}
 */
const isEqual = (provided = "", expected) => {
  const hash = crypto.createHash('SHA512');
  return crypto.timingSafeEqual(
    hash.copy().update(provided).digest(),
    hash.copy().update(expected).digest()
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

module.exports = { useHasuraAuth }
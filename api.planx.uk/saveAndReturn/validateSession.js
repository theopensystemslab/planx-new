const { getGraphQLClient } = require("./utils");

const validateSession = async (req, res, next) => {
  try {
    const { email, sessionId } = req.body;
    if (!email || !sessionId)
      return next({
        status: 400,
        message: "Required value missing"
      });
    
    const { isValid, _sessionData } = await validateRequest(email, sessionId);

    isValid ? 
      res.status(200).send("Valid session") :
      res.status(404).send("Unable to find matching session");
  } catch (error) {
    next(error);
  }
};

const validateRequest = async (email, sessionId) => {
  const result = {
    isValid: false,
    sessionData: null,
  };

  const client = getGraphQLClient();
  const query = `
    query ValidateRequest($email: String, $sessionId: uuid!) {
      lowcal_sessions(
        where: {
          email: { _eq: $email }
          id: { _eq: $sessionId }
          deleted_at: { _is_null: true }
          submitted_at: { _is_null: true }
        }
      ) {
        data
        flow {
          id
        }
      }
    }
  `
  const { lowcal_sessions: [session] }  = await client.request(query, { email: email.toLowerCase(), sessionId })

  if (!session) return result;
  
  result.isValid = true;
  result.sessionData = session.data;
  return result;
};

module.exports = { validateSession };

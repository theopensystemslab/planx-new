const { getGraphQLClient } = require("./utils");

const validateSession = async (req, res, next) => {
  try {
    const { flowId, email, sessionId } = req.body;
    if (!flowId || !email || !sessionId)
      return next({
        status: 400,
        message: "Required value missing"
      });
    
    const { isValid, _sessionData } = await validateRequest(flowId, email, sessionId);

    isValid ? 
      res.status(200).send("Valid session") :
      res.status(404).send("Unable to find matching session");
  } catch (error) {
    next(error);
  }
};

const validateRequest = async (flowId, email, sessionId) => {
  const result = {
    isValid: false,
    sessionData: null,
  };

  const client = getGraphQLClient();
  const query = `
    query ValidateRequest($email: String, $sessionId: uuid!, $flowId: uuid!) {
      lowcal_sessions(where: {email: {_eq: $email}, id: {_eq: $sessionId}, data: {_contains: {id: $flowId}}}) {
        data
      } 
      flows_by_pk(id: $flowId) {
        id
      }
    }
  `
  const { lowcal_sessions, flows_by_pk }  = await client.request(query, { email: email.toLowerCase(), flowId, sessionId })

  if (!flows_by_pk) throw new Error("Unable to validate request");

  if (lowcal_sessions[0]) {
    result.isValid = true;
    result.sessionData = lowcal_sessions[0];
  };

  return result;
};

module.exports = validateSession;
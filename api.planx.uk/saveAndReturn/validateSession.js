const validateSession = async (req, res, next) => {
  try {
    const isValid = await validateRequest(req);
    isValid ? 
      res.status(200).send("Valid session") :
      res.status(404).send("Unable to find matching session");
  } catch (error) {
    next(error);
  }
};

const validateRequest = async (req) => {
  // TODO: Query lowcal table to find if there is a record matching the given email address and session ID
  // const client = getGraphQLClient();
  // const query = "";
  // const response = await client.request(
  //   query,
  //   {
  //     emailAddress: req.body.emailAddress,
  //     sessionId: req.body.sessionId,
  //   }
  // );

  // No table to query, just give a postive answer to test the data flow
  return true;
  // return false;
};

module.exports = validateSession;
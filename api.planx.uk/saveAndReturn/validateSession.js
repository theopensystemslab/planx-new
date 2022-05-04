const { GraphQLClient } = require("graphql-request");
const jsondiffpatch = require("jsondiffpatch");

const { getMostRecentPublishedFlow, getPublishedFlowByDate } = require("../helpers");

// TODO use `useGraphQLClient()` from utils instead 
const client = new GraphQLClient(process.env.HASURA_GRAPHQL_URL, {
  headers: {
    "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET,
  },
});

const validateSession = async (req, res, next) => {
  try {
    // TODO also validate on req.query.email
    const sessionData = await findSession(req.query.sessionId);

    if (sessionData) {
      // reconcile content changes between the published flow state at point of resuming and when the applicant last left off
      const currentFlow = await getMostRecentPublishedFlow(sessionData.flowId);
      const savedFlow = await getPublishedFlowByDate(sessionData.flowId, sessionData.updated_at);
  
      const delta = jsondiffpatch.diff(currentFlow, savedFlow);
      if (delta) {
        const alteredNodes = Object.keys(delta).map((key) => ({
          id: key,
          ...currentFlow[key]
        }));
  
        res.status(200).json({
          message: `Found ${alteredNodes.length} content changes since last save point`,
          alteredNodes
        });

        // TODO reconcile user data against content changes
        //   check if alteredNodes are in session.breadcrumbs & remove them (possible to have content changes that aren't on applicant's path!)
        //   if breadcrumbs changed, then update lowcal session data
      } else {
        res.status(200).json({
          message: "No content changes since last save point; session breadcrumbs not effected",
          alteredNodes: null
        });
      }
    } else {
      res.status(404).send("Unable to find matching session");
    }
  } catch (error) {
    next(error);
  }
};

const findSession = async (id) => {
  const data = await client.request(`
    query FindSession($id: uuid!) {
      lowcal_sessions(
        where: {
          id: {_eq: $id}
        }, 
        limit: 1
      ) {
        id
        flowId: data(path: "$.id")
        passportData: data(path: "$.passport.data")
        breadcrumbs: data(path: "$.breadcrumbs")
        created_at
        updated_at
      }
    }`,
    { 
      id
    }
  );

  return data.lowcal_sessions[0];
};

module.exports = validateSession;
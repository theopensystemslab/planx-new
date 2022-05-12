<<<<<<< HEAD
const jsondiffpatch = require("jsondiffpatch");

const { getMostRecentPublishedFlow, getPublishedFlowByDate } = require("../helpers");
const { useGraphQLClient } = require("./utils");

const client = useGraphQLClient();

const validateSession = async (req, res, next) => {
  try {
    // TODO also validate on req.query.email
    let sessionData = await findSession(req.body.sessionId);

    if (sessionData) {
      // reconcile content changes between the published flow state at point of resuming and when the applicant last left off
      const currentFlow = await getMostRecentPublishedFlow(sessionData.data.id);
      const savedFlow = await getPublishedFlowByDate(sessionData.data.id, sessionData.updated_at);
  
      const delta = jsondiffpatch.diff(currentFlow, savedFlow);
      if (delta) {
        const alteredNodes = Object.keys(delta).map((key) => ({
          id: key,
          ...currentFlow[key]
        }));
        if (alteredNodes.length) {
          let removedBreadcrumbs = {};
          alteredNodes.forEach((node) => {
            // if the session breadcrumbs include any altered content, remove those breadcrumbs so the user will be re-prompted to answer those questions
            if (Object.keys(sessionData.data.breadcrumbs).includes(node.id)) {
              removedBreadcrumbs[node.id] = sessionData.data.breadcrumbs[node.id];
              delete sessionData.data.breadcrumbs[node.id];
            }

            // TODO check if removed breadcrumbs have associated passport vars & also remove from sessionData.data.passport?
            //   **what about collected flags? what about `auto: true`? component dependencies like FindProp/Draw/PlanningConstraints?
          });

          // update the lowcal_session.data to match our updated in-memory sessionData.data
          // TODO ensure node order is preserved
          const reconciledSessionData = await updateLowcalSessionData(req.body.sessionId, sessionData.data);

          res.status(200).json({
            message: `This service has changed since your last save point, affecting at least ${Object.keys(removedBreadcrumbs).length} previous answers. You will be prompted to answer any updated questions again when you continue.`,
            alteredNodes,
            removedBreadcrumbs,
            reconciledSessionData,
          });
        }
      } else {
        res.status(200).json({
          message: "No content changes since last save point",
          alteredNodes: null,
          removedBreadcrumbs: null,
          reconciledSessionData: sessionData.data,
        });
      }
    } else {
      res.status(404).json({ message: "Unable to find your session" });
    }
=======
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
>>>>>>> 59ffe5ae4f08f0149d3a7497a9a73058338aca67
  } catch (error) {
    next(error);
  }
};

<<<<<<< HEAD
const findSession = async (id) => {
  const response = await client.request(`
    query FindSession($id: uuid!) {
      lowcal_sessions(
        where: {
          id: {_eq: $id}
        }, 
        limit: 1
      ) {
        data
        updated_at
      }
    }`,
    { 
      id
    }
  );

  return response.lowcal_sessions[0];
=======
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
>>>>>>> 59ffe5ae4f08f0149d3a7497a9a73058338aca67
};

const updateLowcalSessionData = async (id, data) => {
  const response = await client.request(`
    mutation UpdateLowcalSessionData(
      $id: uuid!,
      $data: jsonb = {},
    ) {
      update_lowcal_sessions_by_pk(
        pk_columns: {id: $id},
        _set: {
          data: $data,
        },
      ) {
        id
        data
        created_at
        updated_at
      }
    }
  `,
  {
    id, data
  }
  );

  return response.update_lowcal_sessions_by_pk && response.update_lowcal_sessions_by_pk.data;
}

module.exports = validateSession;

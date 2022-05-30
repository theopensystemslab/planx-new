const jsondiffpatch = require("jsondiffpatch");

const { getMostRecentPublishedFlow, getPublishedFlowByDate } = require("../helpers");
const { getGraphQLClient } = require("./utils");

const client = getGraphQLClient();

const validateSession = async (req, res, next) => {
  try {
    const { email, sessionId } = req.body;
    if (!email || !sessionId)
      return next({
        status: 400,
        message: "Required value missing"
      });
    
    let sessionData = await findSession(sessionId, email);

    if (sessionData) {
      // reconcile content changes between the published flow state at point of resuming and when the applicant last left off
      const currentFlow = await getMostRecentPublishedFlow(sessionData.data.id);
      const savedFlow = await getPublishedFlowByDate(sessionData.data.id, sessionData.updated_at);
  
      const delta = jsondiffpatch.diff(currentFlow, savedFlow);
      // if there have been content changes, make a list of the alteredNodes
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
          });

          // if we removed user breadcrumbs, check if those breadcrumbs have associated passport variables
          if (Object.keys(removedBreadcrumbs).length) {
            // a flow schema can store the planx variable name under any of these keys
            const planx_keys = ["fn", "val", "output", "dataFieldBoundary"];
            planx_keys.forEach((key) => {
              Object.keys(removedBreadcrumbs).forEach((nodeId) => {
                // check if a removed breadcrumb has a passport var based on the published content at save point
                if (savedFlow[nodeId]?.data?.[key]) {
                  // if it does, remove that passport variable from our sessionData so we don't auto-answer changed questions before the user sees them
                  delete sessionData.data.passport.data[currentFlow[nodeId].data[key]];
                }
              });
            });
          }

          // TODO: FUTURE RECONCILIATION CHECKS
          //   **what about collected flags? what about `auto: true`? component dependencies like FindProp/Draw/PlanningConstraints?

          // update the lowcal_session.data to match our updated in-memory sessionData.data
          const reconciledSessionData = await updateLowcalSessionData(sessionId, sessionData.data);

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
  } catch (error) {
    next(error);
  }
};

const findSession = async (id, email) => {
  const response = await client.request(`
    query FindSession($id: uuid!, $email: String!) {
      lowcal_sessions(
        where: {
          id: {_eq: $id},
          email: {_eq: $email},
        }, 
        limit: 1
      ) {
        data
        updated_at
      }
    }`,
    {
      id, email
    }
  );

  return response.lowcal_sessions[0];
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

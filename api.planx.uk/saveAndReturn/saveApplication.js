const {
  getGraphQLClient,
  sendEmail,
  convertSlugToName,
  getResumeLink,
} = require("./utils");

const { add } = require("date-fns");

const saveApplication = async (req, res, next) => {
  const { flowId, email } = req.body;
  if (!flowId || !email) 
    return next({
      status: 400, 
      message: "Required value missing"
  });

  try {
    const { flowSlug, teamSlug, teamPersonalisation, session } = await validateRequest(flowId, email);
    const templateId = process.env.GOVUK_NOTIFY_SAVE_RETURN_EMAIL_TEMPLATE_ID;
    const config = {
      personalisation: getPersonalisation(
        session,
        flowSlug,
        teamSlug,
        teamPersonalisation
      ),
      reference: null,
      // This value is required to go live, but is not currently set up
      // emailReplyToId: team.emailReplyToId,
    };
    sendEmail(templateId, email, config, res);
  } catch (error) {
    next(error);
  }
};

const validateRequest = async (flowId, email) => {
  try {
    const client = getGraphQLClient();
    const query = `
      query GetFlowByPK($flowId: uuid!) {
        flows_by_pk(id: $flowId) {
          slug
          team {
            slug
            notifyPersonalisation
          }
        }
      }
    `;
    // TODO: Validate that flowId, sessionId, and email are linked in a lowcal_storage row
    const response = await client.request(query, { flowId: flowId });

    return {
      flowSlug: response.flows_by_pk.slug,
      teamSlug: response.flows_by_pk.team.slug,
      teamPersonalisation: response.flows_by_pk.team.notifyPersonalisation,
      session: getSessionDetails(),
    };
  } catch (error) {
    throw new Error("Unable to validate request")
  }
};

const getSessionDetails = () => {
  const session = undefined;

  // query MyQuery {
  //   lowcal_sessions(where: {id: {_eq: "4b34974d-d559-4269-a3ad-bf41a217831f"}}) {
  //     address: data(path: "passport.data.address")
  //     projectType: data(path: "passport.projectType")
  //   }
  // }

  return {
    address:
      session?.data?.passport?.data?._address?.single_line_address ||
      "Address not submitted",
    projectType:
      session?.data?.passport?.data?.["property.type"]?.[0] ||
      "Project type not submitted",
    id: 123456789,
  };
};

const getPersonalisation = (
  session,
  flowSlug,
  teamSlug,
  teamPersonalisation
) => {
  return {
    expiryDate: getApplicationExpiry(),
    resumeLink: getResumeLink(session, teamSlug, flowSlug),
    helpEmail: teamPersonalisation.helpEmail,
    helpPhone: teamPersonalisation.helpPhone,
    helpOpeningHours: teamPersonalisation.helpOpeningHours,
    serviceName: convertSlugToName(flowSlug),
    ...session,
  };
};

const getApplicationExpiry = () => {
  // TODO: Get date from lowcal_session table and handle magic number
  const expiryDate = add(new Date(), { days: 28 }).toDateString();
  return expiryDate;
};

module.exports = saveApplication;

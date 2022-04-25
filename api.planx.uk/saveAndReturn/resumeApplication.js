const { getGraphQLClient, sendEmail, convertSlugToName, getResumeLink } = require("./utils");

const resumeApplication = async (req, res, next) => {
  const { flowId, email } = req.body;
  if (!flowId || !email)
    return next({
      status: 400,
      message: "Required value missing"
    });

  try {
    const { flowSlug, teamSlug, teamPersonalisation, sessions } = await validateRequest(flowId, email, next);
    const templateId = process.env.GOVUK_NOTIFY_RESUME_EMAIL_TEMPLATE_ID;
    const config = {
      personalisation: getPersonalisation(
        sessions,
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

const validateRequest = async (flowId, email, next) => {
  try {
    // TODO: Validate that flowId and email are linked in a lowcal_storage row
    // TODO: Ignore expired applications, if any
    const client = getGraphQLClient();
    const query = `
      query GetFlowByPK ($flowId: uuid!) {
        flows_by_pk(id: $flowId) {
          slug
          team {
            slug
            notifyPersonalisation
          }
        }
      }
    `
    const response = await client.request(query, { flowId: flowId });

    const mockSessions = [
      { id: 123, address: "1 High Street", propertyType: "house" },
      { id: 456, address: "2 High Street", propertyType: "flat" },
      { id: 789, address: "3 High Street", propertyType: "barn" },
    ];

    // const mockEmailAddress = null;

    // if (!mockSessions.length || !mockEmailAddress) {
    //   return next({message: "Unable to find matching application", status: 404})
    // };

    return {
      flowSlug: response.flows_by_pk.slug,
      teamSlug: response.flows_by_pk.team.slug,
      teamPersonalisation: response.flows_by_pk.team.notifyPersonalisation,
      sessions: mockSessions,
    };
  } catch (error) {
    throw new Error("Unable to validate request")
  }
};

const getPersonalisation = (sessions, flowSlug, teamSlug, teamPersonalisation) => {
  return {
    helpEmail: teamPersonalisation.helpEmail,
    helpPhone: teamPersonalisation.helpPhone,
    helpOpeningHours: teamPersonalisation.helpOpeningHours,
    serviceName: convertSlugToName(flowSlug),
    content: buildContentFromSessions(sessions, flowSlug, teamSlug)
  };
};

const buildContentFromSessions = (sessions, flowSlug, teamSlug) => {
  const content = sessions.map(session => {
    const address =
      session.data?.passport?.data?._address?.single_line_address ||
      "Address not submitted";
    const projectType =
      session.data?.passport?.data?.["property.type"]?.[0] ||
      "Project type not submitted";
    const resumeLink = getResumeLink(session, teamSlug, flowSlug)

    return `Address: ${address}
      Project Type: ${projectType}
      Link: ${resumeLink}`;
  }).join("\n\n");
  return content;
};

module.exports = { resumeApplication, buildContentFromSessions };
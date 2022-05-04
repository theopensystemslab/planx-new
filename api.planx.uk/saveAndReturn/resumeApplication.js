const { getGraphQLClient, sendEmail, convertSlugToName, getResumeLink, formatDate } = require("./utils");

const resumeApplication = async (req, res, next) => {
  const { flowId, email } = req.body;
  if (!flowId || !email)
    return next({
      status: 400,
      message: "Required value missing"
    });

  try {
    const { flowSlug, teamSlug, teamPersonalisation, sessions } = await validateRequest(flowId, email, res);
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

const validateRequest = async (flowId, email, res) => {
  try {
    const client = getGraphQLClient();
    const query = `
      query ValidateRequest($email: String, $flowId: uuid!) {
        lowcal_sessions(where: {email: {_ilike: $email}, data: {_contains: {id: $flowId}}}) {
          id
          data
          expiry_date
        } 
        flows_by_pk(id: $flowId) {
          slug
          team {
            slug
            notifyPersonalisation
          }
        }
      }
    `
    const { lowcal_sessions, flows_by_pk } = await client.request(query, { flowId, email });

    if (!flows_by_pk) throw Error;

    // Protect against phishing by returning a positive response even if no matching sessions found
    if (!lowcal_sessions) return res.json({});
    

    return {
      flowSlug: flows_by_pk.slug,
      teamSlug: flows_by_pk.team.slug,
      teamPersonalisation: flows_by_pk.team.notifyPersonalisation,
      sessions: lowcal_sessions,
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
  return sessions.map(session => {
    const address =
      session.data?.passport?.data?._address?.single_line_address ||
      "Address not submitted";
    const projectType =
      session.data?.passport?.data?.["property.type"]?.[0] ||
      "Project type not submitted";
    const resumeLink = getResumeLink(session, teamSlug, flowSlug)
    const expiryDate = formatDate(session.expiry_date);

    return `Address: ${address}
      Project Type: ${projectType}
      Expiry Date: ${expiryDate}
      Link: ${resumeLink}`;
  }).join("\n\n");
};

module.exports = { resumeApplication, buildContentFromSessions };
const {
  getGraphQLClient,
  sendEmail,
  convertSlugToName,
  getResumeLink,
  formatDate,
} = require("./utils");

const saveApplication = async (req, res, next) => {
  const { flowId, email, sessionId } = req.body;
  if (!flowId || !email || !sessionId)
    return next({
      status: 400,
      message: "Required value missing"
    });

  try {
    const { flowSlug, teamSlug, teamPersonalisation, session, teamName } = await validateRequest(flowId, email, sessionId);
    const templateId = process.env.GOVUK_NOTIFY_SAVE_RETURN_EMAIL_TEMPLATE_ID;
    const config = {
      personalisation: getPersonalisation(
        session,
        flowSlug,
        teamSlug,
        teamPersonalisation,
        teamName,
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

const validateRequest = async (flowId, email, sessionId) => {
  try {
    const client = getGraphQLClient();
    const query = `
      query ValidateRequest($email: String, $sessionId: uuid!, $flowId: uuid!) {
        lowcal_sessions(where: {email: {_eq: $email}, id: {_eq: $sessionId}, data: {_contains: {id: $flowId}}}) {
          id
          data
          expiry_date
        } 
        flows_by_pk(id: $flowId) {
          slug
          team {
            name
            slug
            notifyPersonalisation
          }
        }
      }
    `
    const { lowcal_sessions, flows_by_pk }  = await client.request(query, { email: email.toLowerCase(), flowId, sessionId })

    if (!lowcal_sessions || !flows_by_pk) throw Error;

    return {
      flowSlug: flows_by_pk.slug,
      teamSlug: flows_by_pk.team.slug,
      teamPersonalisation: flows_by_pk.team.notifyPersonalisation,
      session: getSessionDetails(lowcal_sessions[0]),
      teamName: flows_by_pk.team.name,
    };
  } catch (error) {
    throw new Error("Unable to validate request")
  }
};

const getSessionDetails = (session) => {
  // TODO: Get human readable values here
  const projectTypes = session?.data?.passport?.data?.["proposal.projectType"]?.join(", ");
  const address = session?.data?.passport?.data?._address?.single_line_address;

  return {
    address: address || "Address not submitted",
    projectType: projectTypes|| "Project type not submitted",
    id: session.id,
    expiryDate: formatDate(session.expiry_date),
  };
};

const getPersonalisation = (
  session,
  flowSlug,
  teamSlug,
  teamPersonalisation,
  teamName,
) => {
  return {
    expiryDate: session.expiryDate,
    resumeLink: getResumeLink(session, teamSlug, flowSlug),
    helpEmail: teamPersonalisation.helpEmail,
    helpPhone: teamPersonalisation.helpPhone,
    helpOpeningHours: teamPersonalisation.helpOpeningHours,
    serviceName: convertSlugToName(flowSlug),
    teamName: teamName,
    ...session,
  };
};

module.exports = saveApplication;

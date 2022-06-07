const { getGraphQLClient, sendEmail, convertSlugToName, getResumeLink, calculateExpiryDate } = require("./utils");

const resumeApplication = async (req, res, next) => {
  try {
    const { teamSlug, email } = req.body;
    if (!teamSlug || !email)
      return next({
        status: 400,
        message: "Required value missing"
      });

    const { teamPersonalisation, sessions, teamName } = await validateRequest(teamSlug, email, res);
    const config = {
      personalisation: getPersonalisation(
        sessions,
        teamSlug,
        teamPersonalisation,
        teamName,
      ),
      reference: null,
      // This value is required to go live, but is not currently set up
      // emailReplyToId: team.emailReplyToId,
    };
    sendEmail("resume", email, config, res);
  } catch (error) {
    next(error);
  }
};

const validateRequest = async (teamSlug, email, res) => {
  try {
    const client = getGraphQLClient();
    const query = `
      query ValidateRequest($email: String, $teamSlug: String) {
        lowcal_sessions(
          where: {
            email: { _eq: $email }
            deleted_at: { _is_null: true }
            submitted_at: { _is_null: true }
          }
          order_by: { flow: { slug: asc }, created_at: asc }
        ) {
          id
          created_at
          flow {
            slug
          }
        }
        teams(where: { slug: { _eq: $teamSlug } }) {
          slug
          name
          notify_personalisation
        }
      }
    `
    const { lowcal_sessions, teams } = await client.request(query, { teamSlug, email: email.toLowerCase() });

    if (!teams?.length) throw Error;

    // Protect against phishing by returning a positive response even if no matching sessions found
    if (!lowcal_sessions?.length) return res.json({});

    return {
      teamSlug: teams[0].slug,
      teamName: teams[0].name,
      teamPersonalisation: teams[0].notify_personalisation,
      sessions: lowcal_sessions,
    };
  } catch (error) {
    throw new Error("Unable to validate request")
  }
};

const getPersonalisation = (sessions, teamSlug, teamPersonalisation, teamName) => {
  return {
    helpEmail: teamPersonalisation.helpEmail,
    helpPhone: teamPersonalisation.helpPhone,
    helpOpeningHours: teamPersonalisation.helpOpeningHours,
    teamName: teamName,
    content: buildContentFromSessions(sessions, teamSlug)
  };
};

const buildContentFromSessions = (sessions, teamSlug) => {
  return sessions.map(session => {
    const service = convertSlugToName(session.flow.slug);
    const address = session.data?.passport?.data?._address?.single_line_address;
    // TODO: Get human readable values here     
    const projectType = session?.data?.passport?.data?.["proposal.projectType"]?.join(", ")
    const resumeLink = getResumeLink(session, teamSlug, session.flow.slug)
    const expiryDate = calculateExpiryDate(session.created_at);

    return `Service: ${service}
      Address: ${address || "Address not submitted"}
      Project Type: ${projectType || "Project type not submitted"}
      Expiry Date: ${expiryDate}
      Link: ${resumeLink}`;
  }).join("\n\n");
};

module.exports = { resumeApplication, buildContentFromSessions };
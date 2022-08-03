const { gql } = require("graphql-request");
const { adminGraphQLClient } = require("../hasura");
const { sendEmail, convertSlugToName, getResumeLink, calculateExpiryDate, getHumanReadableProjectType } = require("./utils");

/**
 * Send a "Resume" email to an applicant which list all open applications for a given council (team)
 * @param {object} req 
 * @param {object} res 
 * @param {object} next 
 */
const resumeApplication = async (req, res, next) => {
  try {
    const { teamSlug, email } = req.body.payload;
    if (!teamSlug || !email)
      return next({
        status: 400,
        message: "Required value missing"
      });

    const { team, sessions } = await validateRequest(teamSlug, email, res);
    // Protect against phishing by returning a positive response even if no matching sessions found
    if (!sessions.length) return res.json({ message: "Success" });

    const config = {
      personalisation: await getPersonalisation(
        sessions,
        team
      ),
      reference: null,
      emailReplyToId: team.notifyPersonalisation.emailReplyToId,
    };
    const response = await sendEmail("resume", email, config);
    return res.json(response);
  } catch (error) {
    return next({ 
      error,
      message: `Failed to send "Resume" email. ${error.message}`
    });
  }
};

/**
 * Validate that there are sessions matching the request
 * XXX: Admin role is required here as we are relying on the combination of email 
 * address + inbox access to "secure" these requests
 * @param {string} teamSlug 
 * @param {string} email 
 */
const validateRequest = async (teamSlug, email) => {
  try {
    const client = adminGraphQLClient;
    const query = gql`
      query ValidateRequest($email: String, $teamSlug: String) {
        lowcal_sessions(
          where: {
            email: { _eq: $email }
            deleted_at: { _is_null: true }
            submitted_at: { _is_null: true }
            flow: { team: { slug: { _eq: $teamSlug } } }
          }
          order_by: { flow: { slug: asc }, created_at: asc }
        ) {
          id
          created_at
          data
          flow {
            slug
          }
        }
        teams(where: { slug: { _eq: $teamSlug } }) {
          slug
          name
          notifyPersonalisation: notify_personalisation
          domain
        }
      }
    `
    const { lowcal_sessions, teams } = await client.request(query, { teamSlug, email: email.toLowerCase() });

    if (!teams?.length) throw Error;

    return {
      team: teams[0],
      sessions: lowcal_sessions,
    };
  } catch (error) {
    throw Error("Unable to validate request")
  }
};

/**
 * Construct personalisation object required for the "Resume" Notify template
 * @param {array} sessions 
 * @param {object} team
 * @returns {object}
 */
const getPersonalisation = async (sessions, team) => {
  return {
    teamName: team.name,
    content: await buildContentFromSessions(sessions, team),
    ...team.notifyPersonalisation,
  };
};

/**
 * Build the main content of the "Resume" email
 * A formatted list of all open applications, including magic link to resume
 * @param {array} sessions 
 * @param {object} team
 * @returns {string}
 */
const buildContentFromSessions = async (sessions, team) => {
  const contentBuilder = async (session) => {
    const service = convertSlugToName(session.flow.slug);
    const address = session.data?.passport?.data?._address?.single_line_address;
    const projectType = await getHumanReadableProjectType(session);
    const resumeLink = getResumeLink(session, team, session.flow.slug)
    const expiryDate = calculateExpiryDate(session.created_at);

    return `Service: ${service}
      Address: ${address || "Address not submitted"}
      Project type: ${projectType || "Project type not submitted"}
      Expiry Date: ${expiryDate}
      Link: ${resumeLink}`;
  };

  const content = await Promise.all(sessions.map(contentBuilder));
  return content.join("\n\n");
};

module.exports = { resumeApplication, buildContentFromSessions };
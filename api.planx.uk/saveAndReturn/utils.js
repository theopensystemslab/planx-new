const { GraphQLClient } = require("graphql-request");
const { NotifyClient } = require("notifications-node-client");
const { format, addDays } = require("date-fns");

const DAYS_UNTIL_EXPIRY = 28;

const singleSessionEmailTemplates = {
  save: process.env.GOVUK_NOTIFY_SAVE_RETURN_EMAIL_TEMPLATE_ID,
  reminder: process.env.GOVUK_NOTIFY_REMINDER_EMAIL_TEMPLATE_ID,
  expiry: process.env.GOVUK_NOTIFY_EXPIRY_EMAIL_TEMPLATE_ID,
};

const multipleSessionEmailTemplates = {
  resume: process.env.GOVUK_NOTIFY_RESUME_EMAIL_TEMPLATE_ID,
};

const emailTemplates = {
  ...singleSessionEmailTemplates,
  ...multipleSessionEmailTemplates,
};

const getNotifyClient = () => new NotifyClient(process.env.GOVUK_NOTIFY_API_KEY_TEAM);

const getGraphQLClient = () => new GraphQLClient(process.env.HASURA_GRAPHQL_URL, {
  headers: {
    "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET,
  }
});

/**
 * Send email using the GovUK Notify client
 * @param {string} template 
 * @param {string} emailAddress 
 * @param {object} config 
 * @param {object} res 
 */
const sendEmail = async (template, emailAddress, config, res) => {
  const templateId = emailTemplates[template];
  if (!templateId) throw new Error("Template ID is required");

  try {
    const notifyClient = getNotifyClient();
    await notifyClient.sendEmail(
      templateId,
      emailAddress,
      config
    );
    const returnValue = { message: "Success" }
    if (template === "save") returnValue.expiryDate = config.personalisation.expiryDate;
    res.json(returnValue);
  } catch (err) {
    console.error({
      message: err.response.data.errors,
      status: err.response.data.status_code,
    });
    res.status(err.response.data.status_code).send(err.response.data);
  };
};

/**
 * Converts a flow's slug to a pretty name
 * XXX: This relies on pretty names not having dashes in them, which may not always be true (e.g. Na h-Eileanan Siar, Stoke-on-Trent)
 * @param {string} slug 
 * @returns {string}
 */
const convertSlugToName = (slug) => {
  const capitalise = (word) => word[0].toUpperCase() + word.substring(1);
  return slug.split("-").map(capitalise).join(" ");
};

/**
 * Build the magic link which will be sent to users via email to continue their application
 * @param {object} session 
 * @param {string} teamSlug 
 * @param {string} flowSlug 
 * @returns {string}
 */
const getResumeLink = (session, teamSlug, flowSlug) => {
  const serviceLink = getServiceLink(teamSlug, flowSlug);
  return `${serviceLink}?sessionId=${session.id}`;
};

/**
 * Construct a link to the service
 * @param {string} teamSlug 
 * @param {string} flowSlug 
 * @returns {string}
 */
const getServiceLink = (teamSlug, flowSlug) => {
  return `${process.env.EDITOR_URL_EXT}/${teamSlug}/${flowSlug}/preview`;
};

/**
 * Return formatted expiry date, based on created_at timestamptz
 * @param {string} date 
 * @returns {string}
 */
const calculateExpiryDate = (createdAt) => {
  const expiryDate = addDays(Date.parse(createdAt), DAYS_UNTIL_EXPIRY);
  const formattedExpiryDate = format(expiryDate, "dd MMMM yyyy");
  return formattedExpiryDate;
}

/**
 * Sends "Save", "Remind", and "Expiry" emails to Save & Return users
 * @param {object} res 
 * @param {object} applicationDetails 
 */
const sendSingleApplicationEmail = async (res, template, email, sessionId) => {
  const { flowSlug, teamSlug, teamPersonalisation, session, teamName } = await validateSingleSessionRequest(email, sessionId);
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
  sendEmail(template, email, config, res);
};

/**
 * Ensure that request for an email relating to a "single session" is valid
 * (e.g. Save, Expiry, Reminder)
 * @param {string} email 
 * @param {string} sessionId 
 * @returns {object}
 */
const validateSingleSessionRequest = async (email, sessionId) => {
  try {
    const client = getGraphQLClient();
    const query = `
    query ValidateSingleSessionRequest($email: String, $sessionId: uuid!) {
      lowcal_sessions(
        where: {
          email: { _eq: $email }
          id: { _eq: $sessionId }
          deleted_at: { _is_null: true }
          submitted_at: { _is_null: true }
        }
      ) {
        id
        data
        created_at
        flow {
          slug
          team {
            name
            slug
            notify_personalisation
          }
        }
      }
    }
    
    `
    const { lowcal_sessions: [session] } = await client.request(query, { email: email.toLowerCase(), sessionId });

    if (!session) throw Error;

    return {
      flowSlug: session.flow.slug,
      teamSlug: session.flow.team.slug,
      teamPersonalisation: session.flow.team.notify_personalisation,
      session: await getSessionDetails(session),
      teamName: session.flow.team.name,
    };
  } catch (error) {
    throw new Error("Unable to validate request")
  }
};

/**
 * Parse session details into an object which will be read by email template
 * @param {string} session 
 * @returns {object}
 */
const getSessionDetails = async (session) => {
  const projectTypes = await getHumanReadableProjectType(session);
  const address = session?.data?.passport?.data?._address?.single_line_address;

  return {
    address: address || "Address not submitted",
    projectType: projectTypes || "Project type not submitted",
    id: session.id,
    expiryDate: calculateExpiryDate(session.created_at),
  };
};

/**
 * Build a personalisation object which is read by email templates
 * @param {string} session 
 * @param {string} flowSlug 
 * @param {string} teamSlug 
 * @param {object} teamPersonalisation 
 * @returns {object}
 */
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
    serviceLink: getServiceLink(teamSlug, flowSlug),
    helpEmail: teamPersonalisation.helpEmail,
    helpPhone: teamPersonalisation.helpPhone,
    helpOpeningHours: teamPersonalisation.helpOpeningHours,
    serviceName: convertSlugToName(flowSlug),
    teamName: teamName,
    ...session,
  };
};

/**
 * Mark a lowcal_session record as deleted
 * Sessions older than a week cleaned up nightly by cron job delete_expired_sessions on Hasura
 * @param {string} sessionId 
 */
const softDeleteSession = async (sessionId) => {
  try {
    const client = getGraphQLClient();
    const mutation = `
      mutation SoftDeleteLowcalSession($sessionId: uuid!) {
        update_lowcal_sessions_by_pk(pk_columns: {id: $sessionId}, _set: {deleted_at: "now()"}){
          id
        }
      }
    `
    await client.request(mutation, { sessionId });
  } catch (error) {
    throw new Error(`Error deleting session ${sessionId}`);
  };
};

/**
 * Mark a lowcal_session record as submitted
 * Sessions older than a week cleaned up nightly by cron job delete_expired_sessions on Hasura
 * @param {string} sessionId 
 */
 const markSessionAsSubmitted = async (sessionId) => {
  try {
    const client = getGraphQLClient();
    const mutation = `
      mutation MarkSessionAsSubmitted($sessionId: uuid!) {
        update_lowcal_sessions_by_pk(pk_columns: {id: $sessionId}, _set: {submitted_at: "now()"}){
          id
        }
      }
    `
    await client.request(mutation, { sessionId });
  } catch (error) {
    throw new Error(`Error marking session ${sessionId} as submitted`);
  };
};

/**
 * Get formatted list of the session's project types
 * @param {array} session 
 * @returns {string}
 */
const getHumanReadableProjectType = async (session) => {
  const rawProjectType = session?.data?.passport?.data?.["proposal.projectType"];
  if (!rawProjectType) return;
  // Get human readable values from db
  const humanReadableList = await getReadableProjectTypeFromRaw(rawProjectType);
  // Join in readable format - en-US ensures we use Oxford commas
  const formatter = new Intl.ListFormat("en-US", { type: "conjunction" });
  const joinedList = formatter.format(humanReadableList);
  // Convert first character to uppercase
  const humanReadableString = joinedList.charAt(0).toUpperCase() + joinedList.slice(1);
  return humanReadableString;
};

/**
 * Query DB to get human readable project type values, based on passport variables
 * @param {array} rawList 
 * @returns {array}
 */
const getReadableProjectTypeFromRaw = async (rawList) => {
  const client = getGraphQLClient();
  const query = `
    query GetHumanReadableProjectType($rawList: [String!]) {
      planning_data_project_types(where: {value: {_in: $rawList}}) {
        description
      }
    }
  `;
  const { planning_data_project_types } = await client.request(query, { rawList });
  const list = planning_data_project_types.map(result => result.description);
  return list;
};

module.exports = {
  getNotifyClient,
  getGraphQLClient,
  sendEmail,
  convertSlugToName,
  getResumeLink,
  sendSingleApplicationEmail,
  singleSessionEmailTemplates,
  softDeleteSession,
  markSessionAsSubmitted,
  DAYS_UNTIL_EXPIRY,
  calculateExpiryDate,
  getHumanReadableProjectType,
};

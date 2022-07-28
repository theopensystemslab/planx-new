const { format, addDays } = require("date-fns");
const { gql } = require("graphql-request");
const { publicGraphQLClient, adminGraphQLClient } = require("../hasura");
const { notifyClient } = require("./notify");

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

/**
 * Send email using the GovUK Notify client
 * @param {string} template 
 * @param {string} emailAddress 
 * @param {object} config 
 */
const sendEmail = async (template, emailAddress, config) => {
  const templateId = emailTemplates[template];
  if (!templateId) throw new Error("Template ID is required");

  try {
    await notifyClient.sendEmail(
      templateId,
      emailAddress,
      config
    );
    const returnValue = { message: "Success" }
    if (template === "expiry") softDeleteSession(config.personalisation.id);
    if (template === "save") returnValue.expiryDate = config.personalisation.expiryDate;
    return returnValue;
  } catch (error) {
    const notifyError = JSON.stringify(error.response.data.errors[0]);
    throw Error(`Error: Failed to send email using Notify client. ${notifyError}`);
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
 * @param {string} template 
 * @param {string} email 
 * @param {string} sessionId 
 */
const sendSingleApplicationEmail = async (template, email, sessionId) => {
  try {
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
      emailReplyToId: teamPersonalisation.emailReplyToId,
    };
    return await sendEmail(template, email, config);
  } catch (error) {
    throw Error(error.message)
  };
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
    const client = publicGraphQLClient;
    const query = gql`
      query ValidateSingleSessionRequest {
        lowcal_sessions {
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
    const headers = getSaveAndReturnPublicHeaders(sessionId, email);
    const { lowcal_sessions: [session] } = await client.request(query, null, headers);

    if (!session) throw Error("Unable to find session");

    return {
      flowSlug: session.flow.slug,
      teamSlug: session.flow.team.slug,
      teamPersonalisation: session.flow.team.notify_personalisation,
      session: await getSessionDetails(session),
      teamName: session.flow.team.name,
    };
  } catch (error) {
    throw Error(`Unable to validate request. ${error.message}`)
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
    const client = adminGraphQLClient;
    const mutation = gql`
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
    const client = adminGraphQLClient;
    const mutation = gql`
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
  const client = publicGraphQLClient;
  const query = gql`
    query GetHumanReadableProjectType($rawList: [String!]) {
      project_types(where: {value: {_in: $rawList}}) {
        description
      }
    }
  `;
  const { project_types } = await client.request(query, { rawList });
  const list = project_types.map(result => result.description);
  return list;
};

/**
 * Scope Save & Return requests for Public role
 * SessionId and Email is required to access a lowcal_sessions record
 * @param {string} sessionId 
 * @param {string} email 
 * @returns {object}
 */
const getSaveAndReturnPublicHeaders = (sessionId, email) => ({
  "x-hasura-lowcal-session-id": sessionId,
  "x-hasura-lowcal-email": email.toLowerCase(),
});

/**
 * Helper method to preserve session data order during reconciliation
 *    XX: This function is also maintained at editor.planx.uk/src/lib/lowcalStorage.ts
 */
const stringifyWithRootKeysSortedAlphabetically = (ob = {}) =>
  JSON.stringify(
    Object.keys(ob)
      .sort()
      .reduce(
        (acc, curr) => ({
          ...acc,
          [curr]: ob[curr],
        }),
        {}
      )
  );

module.exports = {
  getSaveAndReturnPublicHeaders,
  sendEmail,
  convertSlugToName,
  getResumeLink,
  sendSingleApplicationEmail,
  singleSessionEmailTemplates,
  markSessionAsSubmitted,
  DAYS_UNTIL_EXPIRY,
  calculateExpiryDate,
  getHumanReadableProjectType,
  stringifyWithRootKeysSortedAlphabetically,
};

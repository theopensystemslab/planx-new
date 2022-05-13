const { GraphQLClient } = require("graphql-request");
const { NotifyClient } = require("notifications-node-client");
const fs = require('fs');

const { format } = require('date-fns');

const emailTemplates = {
  save: process.env.GOVUK_NOTIFY_SAVE_RETURN_EMAIL_TEMPLATE_ID,
  resume: process.env.GOVUK_NOTIFY_RESUME_EMAIL_TEMPLATE_ID,
  reminder: process.env.GOVUK_NOTIFY_REMINDER_EMAIL_TEMPLATE_ID,
  expiry: process.env.GOVUK_NOTIFY_EXPIRY_EMAIL_TEMPLATE_ID,
};

const getNotifyClient = () =>
  // new NotifyClient(process.env.GOVUK_NOTIFY_API_KEY_TEST);
  new NotifyClient(process.env.GOVUK_NOTIFY_API_KEY_TEAM);

const getGraphQLClient = () => new GraphQLClient(process.env.HASURA_GRAPHQL_URL, {
  headers: {
    "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET,
  }
});

const sendEmail = async (templateId, emailAddress, config, res) => {
  try {
    const notifyClient = getNotifyClient();
    await notifyClient.sendEmail(
      templateId,
      emailAddress,
      config
    );
    //TODO: Change this based on template
    res.json({
      expiryDate: config.personalisation.expiryDate,
    });
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
 * Return raw date from db in a standard format
 * @param {string} date 
 * @returns 
 */
const formatDate = (date) => format(Date.parse(date), "dd MMMM yyyy");

/**
 * Sends "Save", "Remind", and "Expiry" emails to Save & Return users
 * @param {object} res 
 * @param {object} applicationDetails 
 */
const sendSingleApplicationEmail = async (res, {template, flowId, email, sessionId}) => {
  const { flowSlug, teamSlug, teamPersonalisation, session } = await validateRequest(flowId, email, sessionId);
  const templateId = emailTemplates[template];
  if (!templateId) throw new Error("Template ID is required");
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
  if (template === "expiry") { 
    sendEmailWithAttachment(templateId, email, config, res);
  } else {
    sendEmail(templateId, email, config, res);
  }
};

/**
 * TODO
 * @param {string} flowId 
 * @param {string} email 
 * @param {string} sessionId 
 * @returns 
 */
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
            slug
            notifyPersonalisation
          }
        }
      }
    `
    const { lowcal_sessions, flows_by_pk }  = await client.request(query, { email: email.toLowerCase(), flowId, sessionId })

    if (!lowcal_sessions.length || !flows_by_pk) throw Error;

    return {
      flowSlug: flows_by_pk.slug,
      teamSlug: flows_by_pk.team.slug,
      teamPersonalisation: flows_by_pk.team.notifyPersonalisation,
      session: getSessionDetails(lowcal_sessions[0]),
    };
  } catch (error) {
    throw new Error("Unable to validate request")
  }
};

/**
 * TODO
 * @param {string} session 
 * @returns 
 */
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

/**
 * TODO
 * @param {string} session 
 * @param {string} flowSlug 
 * @param {string} teamSlug 
 * @param {object} teamPersonalisation 
 * @returns 
 */
const getPersonalisation = (
  session,
  flowSlug,
  teamSlug,
  teamPersonalisation
) => {
  return {
    expiryDate: session.expiryDate,
    resumeLink: getResumeLink(session, teamSlug, flowSlug),
    serviceLink: getServiceLink(teamSlug, flowSlug),
    helpEmail: teamPersonalisation.helpEmail,
    helpPhone: teamPersonalisation.helpPhone,
    helpOpeningHours: teamPersonalisation.helpOpeningHours,
    serviceName: convertSlugToName(flowSlug),
    ...session,
  };
};

/**
 * Upload CSV file of user data to Notify, attach to email using dataLink
 * TODO: Instead of test file, get user data!
 * @param {string} templateId 
 * @param {string} email 
 * @param {object} config 
 * @param {object} res 
 */
const sendEmailWithAttachment = async (templateId, email, config, res) => {
  fs.readFile('test.csv', (err, csvFile) => {
    console.log(err);
    const notifyClient = getNotifyClient();
    config.personalisation.dataLink = notifyClient.prepareUpload(csvFile, true);
    sendEmail(templateId, email, config, res);
  });
};

module.exports = {
  getNotifyClient,
  getGraphQLClient,
  sendEmail,
  convertSlugToName,
  getResumeLink,
  formatDate,
  sendSingleApplicationEmail,
};

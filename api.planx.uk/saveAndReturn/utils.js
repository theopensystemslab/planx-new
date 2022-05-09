const { GraphQLClient } = require("graphql-request");
const { NotifyClient } = require("notifications-node-client");

const { format } = require('date-fns');

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
  return `${process.env.EDITOR_URL_EXT}/${teamSlug}/${flowSlug}/preview?sessionId=${session.id}`;
};

/**
 * Return raw date from db in a standard format
 * @param {string} date 
 * @returns 
 */
const formatDate = (date) => format(Date.parse(date), "dd MMMM yyyy");

module.exports = {
  getNotifyClient,
  getGraphQLClient,
  sendEmail,
  convertSlugToName,
  getResumeLink,
  formatDate,
};

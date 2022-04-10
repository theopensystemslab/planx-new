const { GraphQLClient } = require("graphql-request");
const { NotifyClient } = require("notifications-node-client");

// Explain test and team keys here
const getNotifyClient = () =>
  // new NotifyClient(process.env.GOVUK_NOTIFY_API_KEY_TEST);
  new NotifyClient(process.env.GOVUK_NOTIFY_API_KEY_TEAM);

const getGraphQLClient = () =>
  new GraphQLClient(process.env.HASURA_GRAPHQL_URL, {
    headers: {
      "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET,
    },
  });

const sendEmail = async (templateId, emailAddress, config, res) => {
  const notifyClient = getNotifyClient();
  try {
    const response = await notifyClient.sendEmail(
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

const convertSlugToName = (slug) => {
  const capitalise = (word) => word[0].toUpperCase() + word.substring(1);
  return slug.split("-").map(capitalise).join(" ");
};

const getResumeLink = (session, teamSlug, flowSlug) => {
  return `${process.env.EDITOR_URL_EXT}/${teamSlug}/${flowSlug}/preview?sessionId=${session.id}`;
};

module.exports = {
  getNotifyClient,
  getGraphQLClient,
  sendEmail,
  convertSlugToName,
  getResumeLink,
};

const { NotifyClient } = require("notifications-node-client");

const notifyClient = new NotifyClient(
  process.env.NODE_ENV === "test" ? 
    process.env.GOVUK_NOTIFY_API_KEY_TEAM_TEST : 
    process.env.GOVUK_NOTIFY_API_KEY_TEAM
);

module.exports = { notifyClient };
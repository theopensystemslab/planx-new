const { NotifyClient } = require("notifications-node-client");

const notifyClient = new NotifyClient(process.env.GOVUK_NOTIFY_API_KEY);

module.exports = { notifyClient };
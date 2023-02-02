import { NotifyClient } from "notifications-node-client";

const notifyClient = new NotifyClient(process.env.GOVUK_NOTIFY_API_KEY);

export { notifyClient };

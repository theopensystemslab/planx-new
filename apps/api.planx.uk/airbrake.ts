import { Notifier } from "@airbrake/node";

import { isLiveEnv } from "./helpers.js";

type Notice = Parameters<Notifier["_sendNotice"]>[0];

/**
 * The Airbrake SDK swallows delivery failures (network errors, 4xx/5xx responses etc),
 * resolving with `notice.error` set rather than rejecting outright, i.e. failing silently.
 *
 * Log these failures (and the error we were trying to report) so they show up in the API logs.
 * We hook into `_sendNotice` rather than `notify` so that errors deliberately dropped by the SDK
 * (e.g. by filters) aren't logged as delivery failures.
 */
export class LoggingNotifier extends Notifier {
  override async _sendNotice(notice: Notice): Promise<Notice> {
    const result = await super._sendNotice(notice);
    if (result.error) {
      console.error("Failed to send error to Airbrake", {
        reason: String(result.error),
        unreportedErrors: result.errors?.map(({ type, message }) => ({
          type,
          message,
        })),
      });
    }
    return result;
  }
}

const airbrake =
  isLiveEnv() &&
  process.env.AIRBRAKE_PROJECT_ID &&
  process.env.AIRBRAKE_PROJECT_KEY
    ? new LoggingNotifier({
        projectId: Number(process.env.AIRBRAKE_PROJECT_ID),
        projectKey: process.env.AIRBRAKE_PROJECT_KEY,
        environment: process.env.NODE_ENV!,
      })
    : undefined;

export default airbrake;

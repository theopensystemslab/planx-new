import { Notifier } from "@airbrake/browser";
import { isLiveEnv } from "utils";

export const logger = getErrorLogger();

function log(...args: any[]) {
  return process.env.SUPRESS_LOGS
    ? () => {
        /* silence */
      }
    : console.log(...args);
}

// forward all JS errors to airbrake.io
function getErrorLogger(): ErrorLogger {
  const hasConfig =
    isLiveEnv() &&
    process.env.REACT_APP_AIRBRAKE_PROJECT_ID &&
    process.env.REACT_APP_AIRBRAKE_PROJECT_KEY;

  if (!hasConfig) {
    log("Airbrake not configured");
    return {
      notify: (error) => {
        log(error);
        log("Error was not sent to Airbrake");
      },
    };
  }

  return new Notifier({
    projectId: Number(process.env.REACT_APP_AIRBRAKE_PROJECT_ID!),
    projectKey: process.env.REACT_APP_AIRBRAKE_PROJECT_KEY!,
    environment:
      window.location.host.endsWith("planx.uk") ||
      window.location.host.endsWith("gov.uk")
        ? "production"
        : window.location.host.endsWith("planx.dev")
        ? "staging"
        : "pullrequest",
  });
}

interface ErrorLogger {
  notify: (args: unknown) => void;
}

import { Notifier } from "@airbrake/browser";
import { isLiveEnv } from "utils";

export const logger = getErrorLogger();

/**
 * Checking a partial host can be unsafe, e.g.
 * window.location.host.endsWith("gov.uk")
 */
function getEnvForAllowedHosts(host: string) {
  switch (host) {
    case "planningservices.newcastle.gov.uk":
    case "planningservices.medway.gov.uk":
    case "planningservices.doncaster.gov.uk":
    case "planningservices.lambeth.gov.uk":
    case "planningservices.southwark.gov.uk":
    case "planningservices.buckinghamshire.gov.uk":
    case "editor.planx.uk":
      return "production";

    case "editor.planx.dev":
      return "staging";

    default:
      "pullrequest";
  }
}

function log(...args: any[]) {
  return process.env.SUPPRESS_LOGS
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
    environment: getEnvForAllowedHosts(window.location.host),
  });
}

interface ErrorLogger {
  notify: (args: unknown) => void;
}

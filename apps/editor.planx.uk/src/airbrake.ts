import { Notifier } from "@airbrake/browser";
import { isLiveEnv } from "utils";

export const logger = getErrorLogger();

/**
 * Checking a partial host can be unsafe, e.g.
 * window.location.host.endsWith("gov.uk")
 */
function getEnvForAllowedHosts(host: string) {
  switch (host) {
    case "planningservices.barnet.gov.uk":
    case "planningservices.birmingham.gov.uk":
    case "planningservices.buckinghamshire.gov.uk":
    case "planningservices.camden.gov.uk":
    case "planningservices.doncaster.gov.uk":
    case "planningservices.epsom-ewell.gov.uk":
    case "planningservices.gateshead.gov.uk":
    case "planningservices.gloucester.gov.uk":
    case "planningservices.horsham.gov.uk":
    case "planningservices.lambeth.gov.uk":
    case "planningservices.lbbd.gov.uk":
    case "planningservices.medway.gov.uk":
    case "planningservices.newcastle.gov.uk":
    case "planningservices.southglos.gov.uk":
    case "planningservices.southwark.gov.uk":
    case "planningservices.stalbans.gov.uk":
    case "planningservices.tewkesbury.gov.uk":
    case "planningservices.westberks.gov.uk":
    case "editor.planx.uk":
      return "production";

    case "editor.planx.dev":
      return "staging";

    default:
      "pullrequest";
  }
}

function log(...args: any[]) {
  return import.meta.env.SUPPRESS_LOGS
    ? () => {
        /* silence */
      }
    : console.log(...args);
}

// forward all JS errors to airbrake.io
function getErrorLogger(): ErrorLogger {
  const hasConfig =
    isLiveEnv() &&
    import.meta.env.VITE_APP_AIRBRAKE_PROJECT_ID &&
    import.meta.env.VITE_APP_AIRBRAKE_PROJECT_KEY;

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
    projectId: Number(import.meta.env.VITE_APP_AIRBRAKE_PROJECT_ID!),
    projectKey: import.meta.env.VITE_APP_AIRBRAKE_PROJECT_KEY!,
    environment: getEnvForAllowedHosts(window.location.host),
  });
}

interface ErrorLogger {
  notify: (args: unknown) => void;
}

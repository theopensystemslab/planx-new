import { Notifier } from "@airbrake/node";

export const reportError = getErrorLogger().notify;

const log = process.env.DEBUG
  ? console.log
  : () => {
      /* silence */
    };

function getErrorLogger(): ErrorLogger {
  const hasConfig =
    process.env.NODE_ENV === "production" &&
    process.env.API_URL_EXT &&
    process.env.AIRBRAKE_PROJECT_ID &&
    process.env.AIRBRAKE_PROJECT_KEY;

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
    projectId: Number(process.env.AIRBRAKE_PROJECT_ID!),
    projectKey: process.env.AIRBRAKE_PROJECT_KEY!,
    environment: process.env.API_URL_EXT!.endsWith("planx.uk")
      ? "production"
      : "staging",
  });
}

interface ErrorLogger {
  notify: (args: unknown) => void;
}

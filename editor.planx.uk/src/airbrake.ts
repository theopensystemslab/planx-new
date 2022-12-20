import { Notifier } from "@airbrake/browser";

export const reportError = getErrorLogger().notify;

// forward all JS errors to airbrake.io
function getErrorLogger(): ErrorLogger {
  const hasConfig =
    process.env.NODE_ENV === "production" &&
    process.env.REACT_APP_AIRBRAKE_PROJECT_ID &&
    process.env.REACT_APP_AIRBRAKE_PROJECT_KEY;

  if (!hasConfig) {
    console.error("Airbrake not configured");
    return {
      notify: (error) => {
        console.error(error);
        console.log("Error was not sent to Airbrake");
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

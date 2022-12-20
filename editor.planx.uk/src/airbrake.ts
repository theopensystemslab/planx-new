import { Notifier } from "@airbrake/browser";

// forward all JS errors to airbrake.io
export const airbrake =
  process.env.NODE_ENV === "production" &&
  process.env.REACT_APP_AIRBRAKE_PROJECT_ID &&
  process.env.REACT_APP_AIRBRAKE_PROJECT_KEY
    ? new Notifier({
        projectId: Number(process.env.REACT_APP_AIRBRAKE_PROJECT_ID),
        projectKey: process.env.REACT_APP_AIRBRAKE_PROJECT_KEY,
        environment:
          window.location.host.endsWith("planx.uk") ||
          window.location.host.endsWith("gov.uk")
            ? "production"
            : window.location.host.endsWith("planx.dev")
            ? "staging"
            : "pullrequest",
      })
    : undefined;

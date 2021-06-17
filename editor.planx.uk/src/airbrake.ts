import { Notifier } from "@airbrake/browser";

// forward all JS errors to airbrake.io
export const airbrake =
  process.env.NODE_ENV !== "test" &&
  process.env.REACT_APP_AIRBRAKE_PROJECT_ID &&
  process.env.REACT_APP_AIRBRAKE_PROJECT_KEY
    ? new Notifier({
        projectId: Number(process.env.REACT_APP_AIRBRAKE_PROJECT_ID),
        projectKey: process.env.REACT_APP_AIRBRAKE_PROJECT_KEY,
        environment: "production",
      })
    : undefined;

import { Notifier } from "@airbrake/node";

const airbrake =
  process.env.NODE_ENV === "production" &&
    process.env.AIRBRAKE_PROJECT_ID &&
    process.env.AIRBRAKE_PROJECT_KEY
    ? new Notifier({
      projectId: Number(process.env.AIRBRAKE_PROJECT_ID),
      projectKey: process.env.AIRBRAKE_PROJECT_KEY,
      environment: process.env.API_URL_EXT!.endsWith("planx.uk")
        ? "production"
        : "staging",
    })
    : undefined;

export default airbrake;
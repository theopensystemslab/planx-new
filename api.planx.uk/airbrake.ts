import { Notifier } from "@airbrake/node";
import { isLiveEnv } from "./helpers";

const airbrake =
  isLiveEnv() &&
    process.env.AIRBRAKE_PROJECT_ID &&
    process.env.AIRBRAKE_PROJECT_KEY
    ? new Notifier({
      projectId: Number(process.env.AIRBRAKE_PROJECT_ID),
      projectKey: process.env.AIRBRAKE_PROJECT_KEY,
      environment: process.env.NODE_ENV!
    })
    : undefined;

export default airbrake;
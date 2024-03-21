import { Notifier } from "@airbrake/node";
import { isLiveEnv } from "../helpers";

export const airbrake =
  isLiveEnv() &&
  process.env.AIRBRAKE_PROJECT_ID &&
  process.env.AIRBRAKE_PROJECT_KEY
    ? new Notifier({
        projectId: Number(process.env.AIRBRAKE_PROJECT_ID),
        projectKey: process.env.AIRBRAKE_PROJECT_KEY,
        environment: process.env.NODE_ENV!,
      })
    : undefined;

/**
 * Simple helper function to manually report an error to Airbrake
 * To be used when you do not want to throw an error and halt execution
 */
export const reportError = (report: { error: any; context: object }) =>
  airbrake ? airbrake.notify(report) : console.log(report);

import { z } from "zod";
import { trackAnalyticsLogExit } from "./service";
import { ValidatedRequestHandler } from "../../shared/middleware/validate";

export const logAnalyticsSchema = z.object({
  query: z.object({
    analyticsLogId: z.string().pipe(z.coerce.number()),
  }),
});

export type LogAnalytics = ValidatedRequestHandler<
  typeof logAnalyticsSchema,
  Record<string, never>
>;

export const logUserExitController: LogAnalytics = async (_req, res) => {
  const { analyticsLogId } = res.locals.parsedReq.query;
  trackAnalyticsLogExit({ id: analyticsLogId, isUserExit: true });
  res.status(204).send();
};

export const logUserResumeController: LogAnalytics = async (_req, res) => {
  const { analyticsLogId } = res.locals.parsedReq.query;
  trackAnalyticsLogExit({ id: analyticsLogId, isUserExit: false });
  res.status(204).send();
};


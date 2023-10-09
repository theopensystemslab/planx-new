import { z } from "zod";
import { trackAnalyticsLogExit } from "./service";
import { ValidatedRequestHandler } from "../../shared/middleware/validate";

export const logAnalyticsSchema = z.object({
  query: z.object({
    analyticsLogId: z.string(),
  }),
});

export type LogAnalytics = ValidatedRequestHandler<
  typeof logAnalyticsSchema,
  Record<string, never>
>;

export const logUserExitController: LogAnalytics = async (req, res) => {
  const { analyticsLogId } = req.query;
  trackAnalyticsLogExit({ id: Number(analyticsLogId), isUserExit: true });
  res.status(204).send();
};

export const logUserResumeController: LogAnalytics = async (req, res) => {
  const { analyticsLogId } = req.query;
  trackAnalyticsLogExit({ id: Number(analyticsLogId), isUserExit: false });
  res.status(204).send();
};

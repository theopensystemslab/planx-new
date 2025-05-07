import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";
import { z } from "zod";

export type ApiResponse<T> = {
  data?: T;
  error?: string;
};

export type NewDashboardLinkHandler = ValidatedRequestHandler<
  typeof createNewDashboardLinkSchema,
  ApiResponse<string>
>;

export const createNewDashboardLinkSchema = z.object({
  body: z.object({
    analyticsLink: z.string().nullable(),
    status: z.string(),
    flowId: z.string(),
    teamId: z.number(),
    serviceSlug: z.string(),
    serviceName: z.string(),
  }),
});

export type CreateNewDashboardLinkParams = {
  analyticsLink: string | null;
  status: string;
  flowId: string;
  teamId: number;
  serviceSlug: string;
};

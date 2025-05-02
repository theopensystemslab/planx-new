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
      flowId: z.string(),
      teamId: z.number(),
      serviceSlug: z.string(),
      serviceName: z.string(),
    }),
  });

export type CreateNewDashboardLinkParams = {
  flowId: string;
  teamId: number;
  serviceSlug: string;
}
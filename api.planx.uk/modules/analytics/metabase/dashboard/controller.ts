import { z } from "zod";
import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";
import { copyDashboard, generatePublicLink, updateFilter } from "./service.js";
import type { CopyDashboardParams } from "./types.js";

// Error response type
interface ErrorResponse {
  error: string;
}

// Response types
type ApiResponse<T> = {
  data?: T;
  error?: string;
};

// Define validation schemas
export const copyDashboardSchema = z.object({
  body: z.object({
    dashboardId: z.number(),
    name: z.string(),
    description: z.string().optional(),
    collectionId: z.number().optional(),
  }),
});

// Define types for validated requests
export type CopyDashboardRequest = ValidatedRequestHandler<
  typeof copyDashboardSchema,
  ApiResponse<CopyDashboardParams>
>;

// Controller functions
export const copyDashboardController: CopyDashboardRequest = async (
  _req,
  res,
) => {
  try {
    const params = res.locals.parsedReq.body;
    const result = await copyDashboard(params);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
};

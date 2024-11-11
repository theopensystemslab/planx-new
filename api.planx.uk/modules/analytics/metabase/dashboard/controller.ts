import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";
import { copyDashboard, generatePublicLink, updateFilter } from "./service.js";
import type { CopyDashboardParams } from "./types.js";
import {
  apiSchemas,
  validateMetabaseRequest,
  metabaseValidators,
} from "../validation/schema.js";
import type { PublicLinkResponse } from "../validation/schema.js";

export const copyDashboardSchema = apiSchemas.copyDashboard;
export const generatePublicLinkSchema = apiSchemas.generatePublicLink;

type ApiResponse<T> = {
  data?: T;
  error?: string;
  errors?: Array<{ field: string; message: string }>;
};

// Controller functions
export const copyDashboardController: ValidatedRequestHandler<
  typeof copyDashboardSchema,
  ApiResponse<CopyDashboardParams>
> = async (_req, res) => {
  try {
    const params = res.locals.parsedReq.body;

    // Additional validation if needed
    const validation = validateMetabaseRequest("copyDashboard", {
      body: params,
    });
    if (!validation.success || !validation.data) {
      return res.status(400).json({
        error: "Validation failed",
        errors: validation.errors,
      });
    }

    const result = await copyDashboard(validation.data.body);
    res.status(201).json({ data: result });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
};

export const updateFilterController: ValidatedRequestHandler<
  typeof apiSchemas.updateFilter,
  ApiResponse<undefined>
> = async (_req, res) => {
  try {
    const { dashboardId, filter, value } = res.locals.parsedReq.body;

    const validation = metabaseValidators.validateFilterUpdate(
      dashboardId,
      filter,
      value,
    );

    if (!validation.success || !validation.data) {
      return res.status(400).json({
        error: "Invalid filter parameters",
        errors: validation.errors,
      });
    }

    await updateFilter(
      validation.data.dashboardId,
      validation.data.filter,
      validation.data.value,
    );

    res.status(200).json({ data: undefined });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
};

export const generatePublicLinkController: ValidatedRequestHandler<
  typeof apiSchemas.generatePublicLink,
  ApiResponse<PublicLinkResponse>
> = async (req, res) => {
  try {
    console.log("Raw request params:", req.params);
    console.log("Parsed request:", res.locals.parsedReq);

    // Fallback to req.params if validation hasn't run
    const dashboardId = parseInt(req.params.dashboardId);

    if (isNaN(dashboardId)) {
      return res.status(400).json({
        error: "Invalid dashboard ID",
      });
    }

    // No need for additional validation since the middleware handled it
    const url = await generatePublicLink(dashboardId);
    res.status(200).json({ data: { url } });
  } catch (error) {
    console.error("Controller error:", error);
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
};

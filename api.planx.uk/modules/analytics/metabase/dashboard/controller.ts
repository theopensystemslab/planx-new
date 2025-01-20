import { createNewDashboard } from "./service.js";
import type { NewDashboardHandler } from "./types.js";

export const metabaseDashboardsController: NewDashboardHandler = async (
  _req,
  res,
) => {
  try {
    const params = {
      ...res.locals.parsedReq.params,
      ...res.locals.parsedReq.body,
    };
    const dashboard = await createNewDashboard(params);
    return res.status(201).json({ data: dashboard });
  } catch (error) {
    console.error("Controller error:", error);
    if (error instanceof Error) {
      console.error("Error stack:", error.stack);
    }
    return res.status(400).json({
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
};

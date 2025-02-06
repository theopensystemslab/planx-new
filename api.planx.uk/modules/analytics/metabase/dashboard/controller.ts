import { createNewDashboard } from "./service.js";
import type { NewDashboardHandler } from "./types.js";
import { ServerError } from "../../../../errors/serverError.js";

export const metabaseDashboardsController: NewDashboardHandler = async (
  _req,
  res,
  next,
) => {
  try {
    const params = {
      ...res.locals.parsedReq.params,
      ...res.locals.parsedReq.body,
    };
    const dashboard = await createNewDashboard(params);
    return res.status(201).json({ data: dashboard });
  } catch (error) {
    next(
      new ServerError({ message: "Failed to create dashboard", cause: error }),
    );
  }
};

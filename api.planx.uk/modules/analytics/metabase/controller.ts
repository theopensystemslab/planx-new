import { createNewDashboardLink } from "./service.js";
import { ServerError } from "../../../errors/serverError.js";
import type { NewDashboardLinkHandler } from "./types.js";

export const metabaseDashboardsController: NewDashboardLinkHandler = async (
  _req,
  res,
  next,
) => {
  try {
    const params = res.locals.parsedReq.body;
    const dashboardLink = await createNewDashboardLink(params);
    return res.status(201).json({ data: dashboardLink });
  } catch (error) {
    next(
      new ServerError({
        message: "Failed to create dashboard link",
        cause: error,
      }),
    );
  }
};

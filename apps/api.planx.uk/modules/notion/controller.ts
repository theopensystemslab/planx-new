import { ServerError } from "../../errors/serverError.js";
import { getComponentGuideMarkdown } from "./service/index.js";
import type { ComponentGuideController } from "./types.js";

export const componentGuideController: ComponentGuideController = async (
  _req,
  res,
  next,
) => {
  try {
    const { pageId } = res.locals.parsedReq.query;
    const result = await getComponentGuideMarkdown(pageId);
    return res.json(result);
  } catch (error) {
    if (error instanceof ServerError) return next(error);
    return next(
      new ServerError({
        message: `Failed to fetch component guide from Notion: ${error}`,
        cause: error,
      }),
    );
  }
};

import { ServerError } from "../../errors/serverError.js";
import { getNotionPage } from "./service.js";
import type { GetNotionPageController } from "./types.js";

export const getNotionPageController: GetNotionPageController = async (
  _req,
  res,
  next,
) => {
  const { pageId } = res.locals.parsedReq.params;

  try {
    const recordMap = await getNotionPage(pageId);
    // Content changes infrequently - allow the browser to cache briefly
    res.set("Cache-Control", "private, max-age=300");
    return res.status(200).json(recordMap);
  } catch (error) {
    next(
      new ServerError({
        message: `Failed to fetch Notion page ${pageId}. ${(error as Error).message}`,
        cause: error,
      }),
    );
  }
};

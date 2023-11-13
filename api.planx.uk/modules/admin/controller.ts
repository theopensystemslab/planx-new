import { generateFeedbackCSV } from "./service/feedback/downloadFeedbackCSV";
import { DownloadFeedbackCSVController } from "./service/feedback/types";

export const downloadFeedbackCSV: DownloadFeedbackCSVController = async (
  req,
  res,
  next,
) => {
  try {
    const feedbackFishCookie = res.locals.parsedReq.query.cookie;
    const csvStream = await generateFeedbackCSV(feedbackFishCookie);
    res.header("Content-type", "text/csv");
    return csvStream.pipe(res);
  } catch (error) {
    return next({
      message:
        "Failed to generate FeedbackFish CSV: " + (error as Error).message,
    });
  }
};

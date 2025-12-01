import { getClient } from "../../../client/index.js";
import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";
import { generateHTMLForSession } from "../../lps/service/generateHTML.js";
import type { submissionSchema } from "./schema.js";

type SubmissionController = ValidatedRequestHandler<
  typeof submissionSchema,
  string
>;

export const submissionController: SubmissionController = async (
  _req,
  res,
  next,
) => {
  const sessionId = res.locals.parsedReq.params.sessionId;

  try {
    const session = await getClient().session.find(sessionId);
    if (!session) throw Error(`Unable to find session ${sessionId}`);

    const html = await generateHTMLForSession(session);

    res.header("Content-type", "text/html");
    res.send(html);
  } catch (error) {
    return next({
      message: "Failed to build HTML: " + (error as Error).message,
    });
  }
};

import { ServerError } from "../../../errors/serverError.js";
import { enhanceProjectDescription } from "./service.js";
import type { Controller } from "./types.js";

export const projectDescriptionController: Controller = async (
  _req,
  res,
  next,
) => {
  try {
    const { original } = res.locals.parsedReq.body;
    const result = await enhanceProjectDescription(original);

    if (result.ok) return res.json({ original, enhanced: result.value });

    switch (result.error) {
      case "INVALID_DESCRIPTION":
        return res.status(400).json({
          error: "INVALID_DESCRIPTION",
          message:
            "The description doesn't appear to be related to a planning application.",
        });

      case "SERVICE_UNAVAILABLE":
        return res.status(503).json({
          error: "SERVICE_UNAVAILABLE",
          message: "LLM service temporarily unavailable",
        });
    }
  } catch (error) {
    return next(
      new ServerError({
        message: `Failed to enhance project description: ${error}`,
      }),
    );
  }
};

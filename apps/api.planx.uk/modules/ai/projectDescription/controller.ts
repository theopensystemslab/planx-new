import { ServerError } from "../../../errors/serverError.js";
import { enhanceProjectDescription } from "./service.js";
import { type Controller, GATEWAY_STATUS } from "./types.js";

export const projectDescriptionController: Controller = async (
  _req,
  res,
  next,
) => {
  try {
    const { original } = res.locals.parsedReq.body;
    const result = await enhanceProjectDescription(original);
    if (result.ok) {
      if (result.value) {
        return res.json({ original, enhanced: result.value });
      } else {
        console.error(
          "Call to gateway succeeded but no enhanced description returned",
        );
        return res.status(500).json({
          error: GATEWAY_STATUS.ERROR,
          message: "Error with request to AI gateway",
        });
      }
    }
    switch (result.error) {
      case GATEWAY_STATUS.INVALID:
        return res.status(400).json({
          error: GATEWAY_STATUS.INVALID,
          message:
            "The description doesn't appear to be related to a planning application.",
        });
      case GATEWAY_STATUS.ERROR:
        return res.status(500).json({
          error: GATEWAY_STATUS.ERROR,
          message: "There was an error with the request to upstream AI gateway",
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

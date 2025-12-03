import { ServerError } from "../../../errors/serverError.js";
import { enhanceProjectDescription } from "./service.js";
import { type Controller, GatewayStatus } from "./types.js";

export const projectDescriptionController: Controller = async (
  req,
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
          error: GatewayStatus.ERROR,
          message: "Error with request to AI gateway",
        });
      }
    }
    switch (result.error) {
      case GatewayStatus.INVALID:
        return res.status(400).json({
          error: GatewayStatus.INVALID,
          message:
            "The description doesn't appear to be related to a planning application.",
        });
      case GatewayStatus.ERROR:
        return res.status(500).json({
          error: GatewayStatus.ERROR,
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

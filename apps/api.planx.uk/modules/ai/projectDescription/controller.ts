import { ServerError } from "../../../errors/serverError.js";
import { enhanceProjectDescription } from "./service.js";
import { GATEWAY_STATUS } from "../types.js";
import type { ProjectDescriptionController } from "./types.js";

export const projectDescriptionController: ProjectDescriptionController =
  async (req, res, next) => {
    try {
      // check we have the API key and exit early if not
      if (!process.env.AI_GATEWAY_API_KEY) {
        return next(
          new ServerError({ message: "AI_GATEWAY_API_KEY is not set" }),
        );
      }

      const { original, modelId, sessionId, flowId } =
        res.locals.parsedReq.body;
      const endpoint = req.route.path;
      const result = await enhanceProjectDescription(
        original,
        endpoint,
        modelId,
        flowId,
        sessionId,
      );
      if (result.ok) {
        if (result.value) {
          return res.json({ original, enhanced: result.value });
        } else {
          return next(
            new ServerError({
              message:
                "Call to gateway succeeded but no enhanced description returned",
            }),
          );
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
          return next(
            new ServerError({
              message: "Error with the request to upstream AI gateway",
            }),
          );
      }
    } catch (error) {
      return next(
        new ServerError({
          message: `Failed to enhance project description: ${error}`,
        }),
      );
    }
  };

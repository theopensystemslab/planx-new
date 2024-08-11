import { Node } from "@opensystemslab/planx-core/types";
import { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";
import { z } from "zod";
import { validateAndDiffFlow } from "./service/index.js";
import { ServerError } from "../../../errors/index.js";

interface ValidateAndDiffResponse {
  message: string;
  alteredNodes: Node[] | null;
  description?: string;
}

export const validateAndDiffSchema = z.object({
  params: z.object({
    flowId: z.string(),
  }),
});

export type ValidateAndDiffFlowController = ValidatedRequestHandler<
  typeof validateAndDiffSchema,
  ValidateAndDiffResponse
>;

export const validateAndDiffFlowController: ValidateAndDiffFlowController =
  async (_req, res, next) => {
    try {
      const { flowId } = res.locals.parsedReq.params;
      const result = await validateAndDiffFlow(flowId);
      return res.json(result);
    } catch (error) {
      return next(
        new ServerError({
          message: `Failed to validate and diff flow for publishing. \n${error}`,
        }),
      );
    }
  };

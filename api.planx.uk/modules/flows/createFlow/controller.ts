import type { FlowGraph } from "@opensystemslab/planx-core/types";
import { z } from "zod";
import { ServerError } from "../../../errors/index.js";
import { createFlow } from "../../../helpers.js";
import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";
import type { Flow } from "../../../types.js";

interface CreateFlowResponse {
  message: string;
  id: Flow["id"];
  slug: Flow["slug"];
}

export const createFlowSchema = z.object({
  body: z.object({
    teamId: z.number(),
    slug: z.string(),
    name: z.string().trim(),
    isTemplate: z.boolean().optional().default(false),
  }),
});

export type CreateFlowController = ValidatedRequestHandler<
  typeof createFlowSchema,
  CreateFlowResponse
>;

export const createFlowController: CreateFlowController = async (
  _req,
  res,
  next,
) => {
  try {
    const { teamId, slug, name, isTemplate } = res.locals.parsedReq.body;
    const flowData: FlowGraph = { _root: { edges: [] } };

    // createFlow automatically handles the associated operation and initial publish
    const { id } = await createFlow({
      teamId,
      slug,
      name,
      isTemplate,
      flowData,
    });

    res.status(200).send({
      message: `Successfully created flow ${slug}`,
      id,
      slug,
    });
  } catch (error) {
    return next(
      new ServerError({ message: `Failed to create flow. Error: ${error}` }),
    );
  }
};

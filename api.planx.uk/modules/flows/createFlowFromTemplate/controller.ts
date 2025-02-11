import { z } from "zod";
import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";
import { ServerError } from "../../../errors/index.js";
import type { Flow } from "../../../types.js";
import { createFlowFromTemplate } from "./service.js";

interface CreateFlowFromTemplateResponse {
  message: string;
  id: Flow["id"];
  slug: Flow["slug"];
}

export const createFlowFromTemplateSchema = z.object({
  params: z.object({
    templateId: z.string(),
  }),
  body: z.object({
    teamId: z.number(),
  }),
});

export type CreateFlowFromTemplateController = ValidatedRequestHandler<
  typeof createFlowFromTemplateSchema,
  CreateFlowFromTemplateResponse
>;

export const createFlowFromTemplateController: CreateFlowFromTemplateController =
  async (_req, res, next) => {
    try {
      const { templateId } = res.locals.parsedReq.params;
      const { teamId } = res.locals.parsedReq.body;

      const { id, slug } = await createFlowFromTemplate(templateId, teamId);

      res.status(200).send({
        message: `Successfully created flow from template ${slug}`,
        id,
        slug,
      });
    } catch (error) {
      return next(
        new ServerError({
          message: `Failed to create flow from template. Error: ${error}`,
        }),
      );
    }
  };

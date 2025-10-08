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
    name: z.string().trim(),
    slug: z.string(),
  }),
});

export type NewFlow = z.infer<typeof createFlowFromTemplateSchema>["body"];

export type CreateFlowFromTemplateController = ValidatedRequestHandler<
  typeof createFlowFromTemplateSchema,
  CreateFlowFromTemplateResponse
>;

export const createFlowFromTemplateController: CreateFlowFromTemplateController =
  async (_req, res, next) => {
    try {
      const { templateId } = res.locals.parsedReq.params;
      const newFlow = res.locals.parsedReq.body;

      const { id } = await createFlowFromTemplate(templateId, newFlow);

      res.status(200).send({
        message: `Successfully created flow from template id ${templateId}`,
        id,
        slug: newFlow.slug,
      });
    } catch (error) {
      return next(
        new ServerError({
          message: `Failed to create flow from template. Error: ${error}`,
        }),
      );
    }
  };

import { z } from "zod";
import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";
import type { Flow } from "../../../types.js";
import { ServerError } from "../../../errors/index.js";
import { copyFlow } from "./service.js";
import { customAlphabet } from "nanoid";

const getReplacementCharacters = () =>
  customAlphabet(
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    5,
  );

interface CopyFlowResponse {
  message: string;
  inserted: boolean;
  replaceValue: string;
  data: Flow["data"];
}

export const copyFlowSchema = z.object({
  params: z.object({
    flowId: z.string(),
  }),
  body: z.object({
    slug: z.string(),
    name: z.string().trim(),
    teamId: z.number().int().positive(),
    replaceValue: z.string().length(5).default(getReplacementCharacters()),
    insert: z.boolean().optional().default(false),
  }),
});

export type CopyFlowRequest = z.infer<typeof copyFlowSchema>["params"] &
  z.infer<typeof copyFlowSchema>["body"];

export type CopyFlowController = ValidatedRequestHandler<
  typeof copyFlowSchema,
  CopyFlowResponse
>;

export const copyFlowController: CopyFlowController = async (
  _req,
  res,
  next,
) => {
  try {
    const { flowId } = res.locals.parsedReq.params;
    const body = res.locals.parsedReq.body;
    const params = { flowId, ...body };

    const { flow, uniqueFlowData } = await copyFlow(params);

    res.status(200).send({
      message: `Successfully copied ${flow.slug}`,
      inserted: body.insert,
      replaceValue: body.replaceValue,
      data: uniqueFlowData,
    });
  } catch (error) {
    return next(
      new ServerError({ message: `Failed to copy flow. Error: ${error}` }),
    );
  }
};

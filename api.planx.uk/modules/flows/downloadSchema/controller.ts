import { z } from "zod";
import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";
import { stringify } from "csv-stringify";
import { getFlowSchema } from "./service.js";
import { ServerError } from "../../../errors/index.js";

interface DownloadFlowSchemaResponse {
  message: string;
}

export const downloadFlowSchema = z.object({
  params: z.object({
    flowId: z.string(),
  }),
});

export type DownloadFlowSchemaController = ValidatedRequestHandler<
  typeof downloadFlowSchema,
  DownloadFlowSchemaResponse
>;

export const downloadFlowSchemaController: DownloadFlowSchemaController =
  async (_req, res, next) => {
    try {
      const { flowId } = res.locals.parsedReq.params;
      const flowSchema = await getFlowSchema(flowId);

      // Build a CSV and stream it
      stringify(flowSchema, { header: true }).pipe(res);
      res.header("Content-type", "text/csv");
      res.attachment(`${flowId}.csv`);
    } catch (error) {
      return next(
        new ServerError({
          message: `Failed to download schema for flow ${res.locals.parsedReq.params?.flowId}: ${error}`,
        }),
      );
    }
  };

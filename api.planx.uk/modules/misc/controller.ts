import { RequestHandler } from "express";
import { stringify } from "csv-stringify";
import { z } from "zod";
import { ValidatedRequestHandler } from "../../shared/middleware/validate";

export const healthCheck: RequestHandler = (_req, res) =>
  res.json({ hello: "world" });

export const downloadApplicationSchema = z.object({
  body: z.object({
    data: z.array(
      z.object({
        question: z.string(),
        responses: z.any(),
        metadata: z.any().optional(),
      }),
    ),
  }),
});

export type DownloadApplicationController = ValidatedRequestHandler<
  typeof downloadApplicationSchema,
  string | Record<"message", string>
>;

/**
 * Allows an applicant to download their application data on the Confirmation page
 */
export const downloadApplicationController: DownloadApplicationController =
  async (req, res, next) => {
    const { data } = res.locals.parsedReq.body;

    try {
      // build a CSV and stream the response
      stringify(data, {
        columns: ["question", "responses", "metadata"],
        header: true,
      }).pipe(res);
      res.header("Content-type", "text/csv");
    } catch (err) {
      next(err);
    }
  };

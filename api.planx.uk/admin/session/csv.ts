import { stringify } from "csv-stringify";
import { NextFunction, Request, Response } from "express";
import { $admin } from "../../client";

export async function getCSVData(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { responses } = await $admin.export.csvData(req.params.sessionId);

    if (req.query?.download) {
      stringify(responses, {
        columns: ["question", "responses", "metadata"],
        header: true,
      }).pipe(res);
      res.header("Content-type", "text/csv");
      res.attachment(`${req.params.sessionId}.csv`);
    } else {
      res.send(responses);
    }
  } catch (error) {
    return next({
      message: "Failed to make CSV data: " + (error as Error).message,
    });
  }
}

export async function getRedactedCSVData(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { redactedResponses } = await $admin.export.csvData(
      req.params.sessionId,
    );

    if (req.query?.download) {
      stringify(redactedResponses, {
        columns: ["question", "responses", "metadata"],
        header: true,
      }).pipe(res);
      res.header("Content-type", "text/csv");
      res.attachment(`${req.params.sessionId}.csv`);
    } else {
      res.send(redactedResponses);
    }
  } catch (error) {
    return next({
      message: "Failed to make CSV data: " + (error as Error).message,
    });
  }
}

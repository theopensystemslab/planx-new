import { generateHTMLOverviewStream } from "@opensystemslab/planx-document-templates";
import { $admin } from "../../client";
import type { NextFunction, Request, Response } from "express";
import type { PlanXExportData } from "@opensystemslab/planx-document-templates/types/types";

export async function getHTMLExport(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { responses } = await $admin.export.csvData(req.params.sessionId);
    res.header("Content-type", "text/html");
    generateHTMLOverviewStream(responses as PlanXExportData[]).pipe(res);
  } catch (error) {
    return next({
      message: "Failed to build HTML: " + (error as Error).message,
    });
  }
}

export async function getRedactedHTMLExport(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { redactedResponses } = await $admin.export.csvData(
      req.params.sessionId
    );
    res.header("Content-type", "text/html");
    generateHTMLOverviewStream(redactedResponses as PlanXExportData[]).pipe(
      res
    );
  } catch (error) {
    return next({
      message: "Failed to build HTML: " + (error as Error).message,
    });
  }
}

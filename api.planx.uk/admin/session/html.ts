import { generateApplicationHTML } from "@opensystemslab/planx-core";
import { $admin } from "../../client";
import type { NextFunction, Request, Response } from "express";
import type { PlanXExportData } from "@opensystemslab/planx-core/types";

export async function getHTMLExport(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { responses } = await $admin.export.csvData(req.params.sessionId);
    res.header("Content-type", "text/html");
    const html = generateApplicationHTML(responses as PlanXExportData[]);
    res.send(html);
  } catch (error) {
    return next({
      message: "Failed to build HTML: " + (error as Error).message,
    });
  }
}

export async function getRedactedHTMLExport(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { redactedResponses } = await $admin.export.csvData(
      req.params.sessionId,
    );
    res.header("Content-type", "text/html");
    const html = generateApplicationHTML(
      redactedResponses as PlanXExportData[],
    );
    res.send(html);
  } catch (error) {
    return next({
      message: "Failed to build HTML: " + (error as Error).message,
    });
  }
}

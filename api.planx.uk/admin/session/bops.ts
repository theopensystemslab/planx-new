import { Request, Response, NextFunction } from "express";
import { $admin } from "../../client";

export const getBOPSPayload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { exportData } = await $admin.export.bopsPayload(req.params.sessionId);
    res.set("content-type", "application/json")
    return res.send(exportData)
  } catch (error) {
    return next({
      message: "Failed to get BOPS payload: " + (error as Error).message,
    });
  }
};

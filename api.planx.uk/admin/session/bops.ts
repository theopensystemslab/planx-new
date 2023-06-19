import { Request, Response, NextFunction } from "express";
import { $admin } from "../../client";

export const getBOPSPayload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = await $admin.generateBOPSPayload(req.params.sessionId);
    res.set("content-type", "application/json")
    return res.send(payload)
  } catch (error) {
    return next({ message: "Failed to get BOPS payload: " + (error as Error).message });
  }
};

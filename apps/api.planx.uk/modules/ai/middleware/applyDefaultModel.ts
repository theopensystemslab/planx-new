import type { NextFunction, Request, Response } from "express";

const DEFAULT_MODEL_ID = "google/gemini-2.5-pro";

export const applyDefaultModel = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    req.body.modelId = DEFAULT_MODEL_ID;
    next();
  } catch (error) {
    console.error("Error applying default model to request:", error);
    return res.status(500).send();
  }
};

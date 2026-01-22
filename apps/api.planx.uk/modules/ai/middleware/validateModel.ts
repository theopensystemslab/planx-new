import type { NextFunction, Request, Response } from "express";

import { ServerError } from "../../../errors/index.js";
import { API_ERROR_STATUS } from "../types.js";

// currently we just accept a fixed list of recent Google Gemini models
export const ACCEPTED_MODEL_IDS = [
  "google/gemini-2.5-pro",
  "google/gemini-2.5-flash",
  "google/gemini-3-pro-preview",
  "google/gemini-3-flash",
];
export const DEFAULT_MODEL_ID = "google/gemini-2.5-pro";

export const validateModel = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // if no model ID is supplied in the request, we enforce a default
    const modelId = req.body.modelId;
    if (!modelId) {
      console.log(
        `No model specified in request - applying default model: ${DEFAULT_MODEL_ID}`,
      );
      req.body.modelId = DEFAULT_MODEL_ID;
      next();
    } else if (!ACCEPTED_MODEL_IDS.includes(modelId)) {
      console.warn(`Invalid model ID specified: ${modelId}`);
      return res.status(400).json({
        error: API_ERROR_STATUS.GUARDRAIL,
        message: `Invalid model ID specified: ${modelId}. Please choose one of the following: ${ACCEPTED_MODEL_IDS.join(", ")}`,
      });
    } else {
      next();
    }
  } catch (error) {
    console.error("Error validating model in request:", error);
    next(
      new ServerError({
        message: `Failed to validate model in request`,
      }),
    );
  }
};

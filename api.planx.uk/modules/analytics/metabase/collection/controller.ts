import { z } from "zod";
import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";
import { checkCollections, newCollection } from "./service.js";
import type { NewCollectionRequest } from "./types.js";
import type { Request, Response } from "express";

// Controller functions
export const checkCollectionsController = async (
  _req: Request,
  res: Response,
) => {
  try {
    const name = _req.query.name as string;

    if (!name) {
      return res.status(400).json({ error: "Name parameter is required" });
    }

    const collections = await checkCollections(name);

    res.status(200).json(collections);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Failed to fetch collections" });
  }
};

export const newCollectionController: NewCollectionRequest = async (
  _req,
  res,
) => {
  try {
    const params = res.locals.parsedReq.body;
    const collection = await newCollection(params);
    res.status(201).json({ data: collection });
  } catch (error) {
    res.status(400).json({
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
};

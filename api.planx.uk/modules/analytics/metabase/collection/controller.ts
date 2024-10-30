import { z } from "zod";
import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";
import { checkCollections, newCollection } from "./service.js";
import type { NewCollectionParams } from "./types.js";
import type { Request, Response } from "express";

// Error response type
interface ErrorResponse {
  error: string;
}

// Response types
type ApiResponse<T> = {
  data?: T;
  error?: string;
};

// Define validation schemas
export const newCollectionSchema = z.object({
  body: z.object({
    name: z.string(),
    description: z.string().optional(),
    parentId: z.number().optional(),
  }),
});

// Define types for validated requests
export type NewCollectionRequest = ValidatedRequestHandler<
  typeof newCollectionSchema,
  ApiResponse<NewCollectionParams>
>;

// Controller functions
export const checkCollectionsController = async (
  _req: Request,
  res: Response,
) => {
  try {
    const name = res.locals.parsedReq.body.name;
    const collections = await checkCollections(name);

    res.status(200).json(collections);
  } catch (error) {
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

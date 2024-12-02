import { newCollection } from "./service.js";
import type { NewCollectionRequest } from "./types.js";

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

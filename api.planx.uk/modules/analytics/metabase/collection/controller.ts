import { createCollectionIfDoesNotExist } from "./service.js";
import type { NewCollectionRequestHandler } from "./types.js";

export const MetabaseCollectionsController: NewCollectionRequestHandler =
  async (_req, res) => {
    try {
      const params = res.locals.parsedReq.body;
      const collection = await createCollectionIfDoesNotExist(params);
      res.status(201).json({ data: collection });
    } catch (error) {
      res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    }
  };

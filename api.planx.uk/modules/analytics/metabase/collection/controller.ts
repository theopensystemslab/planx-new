import { createTeamCollection } from "./service.js";
import type { NewCollectionRequestHandler } from "./types.js";

export const metabaseCollectionsController: NewCollectionRequestHandler =
  async (_req, res) => {
    try {
      const params = {
        ...res.locals.parsedReq.params,
        ...res.locals.parsedReq.body,
      };
      const collection = await createTeamCollection(params);
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

import { createTeamCollection } from "./service.js";
import type { NewCollectionRequestHandler } from "./types.js";

export const metabaseCollectionsController: NewCollectionRequestHandler =
  async (_req, res) => {
    try {
      const slug = res.locals.parsedReq.body.slug;
      const collection = await createTeamCollection(slug);
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

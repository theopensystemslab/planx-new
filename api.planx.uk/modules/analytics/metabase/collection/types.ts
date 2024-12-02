import { z } from "zod";
import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";

type ApiResponse<T> = {
  data?: T;
  error?: string;
};

export interface NewCollectionParams {
  name: string;
  description?: string;
  /** Optional; if the collection is a child of a parent, specify parent ID here
   * For council teams, parent collection should be 58
   */
  parentId?: number;
}

/** Metbase collection ID for the the "Council" collection **/
const COUNCIL_COLLECTION_ID = 58;

export const newCollectionSchema = z.object({
  body: z.object({
    name: z.string(),
    description: z.string().optional(),
    parentId: z.number().default(COUNCIL_COLLECTION_ID),
  }),
});

export type NewCollectionRequestHandler = ValidatedRequestHandler<
  typeof newCollectionSchema,
  ApiResponse<NewCollectionResponse>
>;

export interface NewCollectionResponse {
  id: number;
  name: string;
}

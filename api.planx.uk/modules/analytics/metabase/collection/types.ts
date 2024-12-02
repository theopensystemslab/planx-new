import { z } from "zod";
import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";

type ApiResponse<T> = {
  data?: T;
  error?: string;
};

export interface NewCollectionParams {
  /** The name of the new collection */
  name: string;
  description?: string;
  /** Optional; if the collection is a child of a parent, specify parent ID here
   * For council teams, parent collection should be 58
   */
  parent_id?: number;
  namespace?: string;
  authority_level?: null;
}

export const newCollectionSchema = z.object({
  body: z.object({
    name: z.string(),
    description: z.string().optional(),
    parent_id: z.number().optional(),
    namespace: z.string().optional(),
    authority_level: z.null().optional(),
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

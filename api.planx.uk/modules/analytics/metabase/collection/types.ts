import { z } from "zod";
import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";

type ApiResponse<T> = {
  data?: T;
  error?: string;
};

/** Interface for incoming request, in camelCase */
export interface NewCollectionParams {
  name: string;
  description?: string;
  /** Optional; if the collection is a child of a parent, specify parent ID here */
  parentId?: number;
}

/** Interface for request after transforming to snake case (Metabase takes snake while PlanX API takes camel) */
export interface MetabaseCollectionParams {
  name: string;
  description?: string;
  parent_id?: number;
}

/** Metbase collection ID for the the "Council" collection **/
// const COUNCILS_COLLECTION_ID = 58;

export const checkCollectionsSchema = z.object({
  body: z
    .object({
      name: z.string(),
      description: z.string().optional(),
      parentId: z.number().optional(), //.default(COUNCILS_COLLECTION_ID),
    })
    .transform((data) => ({
      name: data.name,
      description: data.description,
      parent_id: data.parentId,
    })),
});

export type NewCollectionRequestHandler = ValidatedRequestHandler<
  typeof checkCollectionsSchema,
  ApiResponse<NewCollectionResponse>
>;

export interface NewCollectionResponse {
  id: number;
  name: string;
}

export interface GetCollectionResponse {
  id: number;
  name: string;
  parent_id: number;
}

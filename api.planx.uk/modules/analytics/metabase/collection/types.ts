import { z } from "zod";
import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";

type ApiResponse<T> = {
  data?: T;
  error?: string;
};

/** Interface for incoming request, in camelCase */
export interface NewCollectionParams {
  slug: string;
  description?: string;
  /** Optional; if the collection is a child of a parent, specify parent ID here */
  parentId?: number;
}

/** Interface for request after transforming to snake case (Metabase takes snake while PlanX API takes camel) */
export type MetabaseCollectionParams = Omit<NewCollectionParams, "slug"> & {
  name: string;
};

/** Metbase collection ID for the the "Council" collection **/
// const COUNCILS_COLLECTION_ID = 58;

export const createTeamCollectionSchema = z.object({
  body: z.object({
    slug: z.string(),
    description: z.string().optional(),
    parentId: z.number().optional(), //.default(COUNCILS_COLLECTION_ID),
  }),
});

export type NewCollectionRequestHandler = ValidatedRequestHandler<
  typeof createTeamCollectionSchema,
  ApiResponse<number>
>;

export interface NewCollectionResponse {
  id: number;
  slug: string;
}

export interface GetCollectionResponse {
  id: number;
  slug: string;
  parentId: number;
}

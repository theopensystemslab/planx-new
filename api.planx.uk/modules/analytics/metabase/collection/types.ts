import { z } from "zod";
import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";
import type { ApiResponse } from "../shared/types.js";

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

/** TODO: when running on production, turn below comment back into code
 * the Metabase collection ID is for the "Council" collection
 * see https://github.com/theopensystemslab/planx-new/pull/4072#discussion_r1892631692
 **/
// const COUNCILS_COLLECTION_ID = 58;

export const createTeamCollectionSchema = z.object({
  params: z.object({
    slug: z.string(),
  }),
  body: z.object({
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

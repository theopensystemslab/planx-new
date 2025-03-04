import { z } from "zod";
import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";
import type { ApiResponse } from "../shared/types.js";

/** Interface for incoming request */
export interface NewCollectionParams {
  slug: string;
}

/** We use a name and not slug here so that the eventual dashboard name is in title case */
export type CreateCollectionParams = {
  name: string;
  parentId: number;
};

export type MetabaseCreateCollectionParams = {
  name: string;
  parent_id?: number;
};

export const createTeamCollectionSchema = z.object({
  body: z.object({
    slug: z.string().min(1),
    description: z.string().optional()
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
  name: string;
  id: number;
  slug: string;
  parentId: number;
}

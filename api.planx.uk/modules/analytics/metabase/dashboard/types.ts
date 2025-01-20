import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";
import type { ApiResponse } from "../shared/types.js";
import { z } from "zod";

export interface CreateNewDashboardParams {
  teamName: string;
  /** Original / template Metabase Dashboard ID, it is the number that follows /dashboard/ in the URL */
  templateId: number;
  /** What the copied dashboard should be named; should be the original dashboard name
   * but with 'Template' replaced with council name */
  name?: string;
  /** Optional text to be displayed as the dashboard description */
  description?: string;
  /** Number for the copied dashboard's parent collection */
  collectionId: number;
  /** Optional number for the copied dashboard's placement within the collection */
  collectionPosition?: number | null;
  /** A filter that should be automatically set, eg `Team slug` */
  filter: string;
  /** Default filter value, eg `council-name` */
  value: string;
}

/* We don't want users to be able to deep copy templates / dashboards because it will wreak Metabase havoc. This is why there is no isDeepCopy option here */
export type CopyDashboardParams = {
  name: string;
} & Pick<
  CreateNewDashboardParams,
  "templateId" | "description" | "collectionId" | "collectionPosition"
>;

// Version of CopyDashboardParams suitable for Metabase API
export type MetabaseCopyDashboardParams = {
  name: string;
  description?: string;
  collection_id?: number;
  collection_position?: number | null;
  is_deep_copy?: boolean;
};

// Convert to Metabase API structure
export function toMetabaseParams(
  params: CopyDashboardParams,
): MetabaseCopyDashboardParams {
  return {
    name: params.name,
    description: params.description,
    collection_id: params.collectionId,
    collection_position: params.collectionPosition,
    /* Hard-coded false because deep copies will be messy in Metabase */
    is_deep_copy: false,
  };
}

export type UpdateFilterParams = {
  dashboardId: number;
} & Pick<CreateNewDashboardParams, "filter" | "value">;

export const createNewDashboardSchema = z.object({
  params: z.object({
    slug: z.string(),
    service: z.string(),
    templateId: z.coerce.number(),
  }),
  body: z.object({
    teamName: z.string(),
    description: z.string().optional(),
    collectionId: z.coerce.number(),
    collectionPosition: z.coerce.number().nullable().optional(),
    filter: z.string(),
    value: z.string(),
  }),
});

export type NewDashboardHandler = ValidatedRequestHandler<
  typeof createNewDashboardSchema,
  ApiResponse<string>
>;

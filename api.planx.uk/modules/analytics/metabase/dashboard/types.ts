import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";
import type { ApiResponse } from "../shared/types.js";
import { z } from "zod";

export interface CreateNewDashboardParams {
  teamName: string;
  /** Original / template Metabase Dashboard ID, it is the number that follows /dashboard/ in the URL */
  templateId: number;
  /** Optional text to be displayed as the dashboard description */
  description?: string;
  /** Number for the copied dashboard's parent collection */
  collectionId: number;
  /** A filter that should be automatically set, eg `Team slug` */
  filter: string;
  /** Default filter value, eg `council-name` */
  value: string;
}

/* We don't want users to be able to deep copy templates / dashboards because it will wreak Metabase havoc. This is why there is no isDeepCopy option here */
export type CopyDashboardParams = {
  templateId: number;
  name: string;
  description?: string;
  collectionId: number;
};

// Version of CopyDashboardParams suitable for Metabase API
export type MetabaseCopyDashboardParams = {
  name: string;
  description?: string;
  collection_id?: number;
  collection_position?: number | null;
};

export type UpdateFilterParams = {
  dashboardId: number;
  filter: string;
  value: string;
};

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

export interface MetabaseDashboardResponse {
  name: string;
  id: number;
  collectionId: number;
  description: string;
  parameters: FilterParam[];
}

export interface UpdateFilterResponse {
  success: boolean;
  updatedFilter: string;
}

export interface FilterParam {
  name: string;
  type: string;
  // The Metabase API expects filter default values as arrays, even if there's only one (eg for multi-select filters)
  value: string[];
}

export type GetDashboardResponse = Pick<
  MetabaseDashboardResponse,
  "name" | "id" | "collectionId" | "parameters"
>;

export type GetFilterResponse = Pick<MetabaseDashboardResponse, "parameters">;

export interface UpdatedFilterResponse {
  parameter: FilterParam;
  updatedValue: string | undefined;
}

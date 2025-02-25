import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";
import type { ApiResponse } from "../shared/types.js";
import { z } from "zod";

export interface CreateNewDashboardParams {
  flowId: string;
  teamId: number;
  serviceSlug: string;
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
};

export type UpdateFilterParams = {
  dashboardId: number;
  filter: string;
  value: string;
};

export const createNewDashboardSchema = z.object({
  body: z.object({
    flowId: z.string(),
    teamId: z.number(),
    serviceSlug: z.string(),
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

export interface UpdatedFilterResponse {
  parameter: FilterParam;
  updatedValue: string | undefined;
}

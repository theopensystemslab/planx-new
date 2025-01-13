import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";
import { z } from "zod";

export interface CreateNewDashboardParams {
  /** Original / template Metabase Dashboard ID, it is the number that follows /dashboard/ in the URL */
  templateId: number;
  /**  What the copied dashboard should be named;
   * should be the original dashboard name
   * but with 'Template' replaced with council name */
  // name?: string;
  /** Optional text to be displayed as the dashboard description */
  description?: string;
  /** Number for the copied dashboard's parent collection */
  collectionId: number;
  /** Optional number for the copied dashboard's placement within the collection */
  collectionPosition?: number | null;
  /** Toggle whether or not the questions are copied as well;
   * Metabase deep-copies by default, but we want shallow
   * shallow = "Only duplicate the dashboard" */
  isDeepCopy: boolean;
  /** A filter that should be automatically set, eg `Team slug` */
  filter: string;
  /** Default filter value, eg `council-name` */
  value: string;
}

export type CopyDashboardParams = {
  name: string;
} & Pick<
  CreateNewDashboardParams,
  | "templateId"
  | "description"
  | "collectionId"
  | "collectionPosition"
  | "isDeepCopy"
>;

export type UpdateFilterParams = {
  dashboardId: number;
} & Pick<CreateNewDashboardParams, "filter" | "value">;

type ApiResponse<T> = {
  data?: T;
  error?: string;
};

export const createNewDashboardSchema = z.object({
  params: z.object({
    templateId: z.number(),
    description: z.string().optional(),
    collectionId: z.number(),
    collectionPosition: z.number().optional(),
    isDeepCopy: z.boolean(),
    filter: z.string(),
    value: z.string(),
  }),
  body: z.object({
    description: z.string().optional(),
    parentId: z.number().optional(), //.default(COUNCILS_COLLECTION_ID),
  }),
});

export type NewDashboardHandler = ValidatedRequestHandler<
  typeof createNewDashboardSchema,
  ApiResponse<string>
>;

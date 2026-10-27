import { z } from "zod";

export const searchDefaults = {
  sort: "last-edited",
  sortDirection: "desc",
} as const;

const sortSchema = z
  .enum(["last-edited", "last-published", "name"])
  .catch(searchDefaults.sort);

const sortDirectionSchema = z
  .enum(["asc", "desc"])
  .catch(searchDefaults.sortDirection);

export const flowsSearchSchema = z.object({
  sort: sortSchema.default(searchDefaults.sort),
  sortDirection: sortDirectionSchema.default(searchDefaults.sortDirection),
  search: z.string().optional(),
  "service-status": z.enum(["online", "offline"]).optional(),
  "flow-type": z
    .enum(["submission", "fee carrying", "service charge enabled"])
    .optional(),
  templates: z.enum(["templated", "source template"]).optional(),
  "lps-listing": z.enum(["listed", "not listed"]).optional(),
});

export const partialFlowsSearchSchema = flowsSearchSchema
  .extend({ sort: sortSchema, sortDirection: sortDirectionSchema })
  .partial();

export type FlowSearch = z.infer<typeof flowsSearchSchema>;

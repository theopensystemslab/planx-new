import { fallback } from "@tanstack/zod-adapter";
import { z } from "zod";

export const searchDefaults = {
  sort: "last-edited",
  sortDirection: "desc",
} as const;

export const flowsSearchSchema = z.object({
  sort: fallback(
    z.enum(["last-edited", "last-published", "name"]),
    searchDefaults.sort,
  ).default(searchDefaults.sort),
  sortDirection: fallback(
    z.enum(["asc", "desc"]),
    searchDefaults.sortDirection,
  ).default(searchDefaults.sortDirection),
  search: z.string().optional(),
  "service-status": z.enum(["online", "offline"]).optional(),
  "flow-type": z
    .enum(["submission", "fee carrying", "service charge enabled"])
    .optional(),
  templates: z.enum(["templated", "source template"]).optional(),
  "lps-listing": z.enum(["listed", "not listed"]).optional(),
});

export type FlowSearch = z.infer<typeof flowsSearchSchema>;

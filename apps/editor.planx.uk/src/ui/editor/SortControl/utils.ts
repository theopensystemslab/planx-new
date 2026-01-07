import { slugify } from "utils";
import { z } from "zod";

import { SortableFields } from "./SortControl";

const routeQuerySchema = z.object({
  sort: z.string(),
  sortDirection: z.enum(["asc", "desc"]),
});

export const getSortParams = <T extends object>(
  routeQueryParams: Record<string, unknown>,
  sortOptions: SortableFields<T>[],
): {
  sortObject: SortableFields<T>;
  sortDirection: "asc" | "desc";
} => {
  const validSortUrl = routeQuerySchema.safeParse(routeQueryParams);
  if (validSortUrl.success) {
    const sortObject = sortOptions.find(
      (option) => slugify(option.displayName) === validSortUrl.data.sort,
    );

    if (sortObject)
      return { sortObject, sortDirection: validSortUrl.data.sortDirection };
  }

  return { sortObject: sortOptions[0], sortDirection: "desc" };
};

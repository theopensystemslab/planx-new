import { Route } from "navi";
import { slugify } from "utils";
import { z } from "zod";

import { SortableFields } from "./SortControl";

const RouteQuerySchema = z.object({
  sort: z.string(),
  sortDirection: z.enum(["asc", "desc"]),
});

export const getSortParams = <T extends object>(
  route: Route<any>,
  sortOptions: SortableFields<T>[],
): {
  sortObject: SortableFields<T>;
  sortDirection: "asc" | "desc";
} => {
  const validSortUrl = RouteQuerySchema.safeParse(route.url.query);
  if (validSortUrl.success) {
    const sortObject = sortOptions.find(
      (option) => slugify(option.displayName) === validSortUrl.data.sort,
    );

    if (sortObject)
      return { sortObject, sortDirection: validSortUrl.data.sortDirection };
  }

  return { sortObject: sortOptions[0], sortDirection: "asc" };
};

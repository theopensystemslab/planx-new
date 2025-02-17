import { Params } from "navi";
import { slugify } from "utils";
import { z } from "zod";

import { SortableFields } from "./SortControl";
import { get } from "lodash";
import { Paths } from "type-fest";

const routeQuerySchema = z.object({
  sort: z.string(),
  sortDirection: z.enum(["asc", "desc"]),
});

export const getSortParams = <T extends object>(
  routeQueryParams: Params,
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


export const sortNullToBottom =<T extends object> (a: T,b: T, fieldName:Paths<T>)=>{
  const aValue = get(a, fieldName);
  const bValue = get(b, fieldName);
  
  if (!aValue && !bValue) return 0;
  if (!aValue) return 1;
  if (!bValue) return -1;
  
  // For non-null values, maintain their relative order
  return 0;
}
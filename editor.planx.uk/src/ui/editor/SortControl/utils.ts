import { Route } from "navi";
import { slugify } from "utils";

import { SortableFields } from "./SortControl";

export const getSortParams = <T extends object>(
  route: Route<any>,
  sortOptions: SortableFields<T>[],
): {
  sortObject: SortableFields<T>;
  sortDirection: "asc" | "desc";
} => {
  const { sort, sortDirection: sortDirectionParam } = route.url.query;
  const sortObject = sortOptions.find(
    (option) => slugify(option.displayName) === sort,
  );
  const sortDirection =
    sortDirectionParam === "asc" || sortDirectionParam === "desc"
      ? sortDirectionParam
      : "desc";
  if (sortObject) return { sortObject, sortDirection };
  return { sortObject: sortOptions[0], sortDirection };
};

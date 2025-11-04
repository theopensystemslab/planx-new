import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import get from "lodash/get";
import orderBy from "lodash/orderBy";
import React, { useEffect, useMemo, useState } from "react";
import { useCurrentRoute, useNavigation } from "react-navi";
import { Paths } from "type-fest";
import SelectInput from "ui/shared/SelectInput/SelectInput";
import { slugify } from "utils";

import { getSortParams } from "./utils";

type SortDirection = "asc" | "desc";

export interface SortableFields<T> {
  /** displayName is a string to use in the Select */
  displayName: string;
  /** fieldName is the key of the object used to sort */
  fieldName: Paths<T>;
  /** directionNames should be an object specifying display values for ascending and descending sort order */
  directionNames: { asc: string; desc: string };
}
/**
 * @component
 * @description Sorts a list of objects
 * @param {Type} T - a type to define the shape of the data in the records array
 * @param {Array} props.records - an array of objects to sort
 * @param {Function} props.setRecords - A way to set the new sorted order of the array
 * @param {Array} props.sortOptions - An array of objects to define displayName, fieldName, and directionNames
 * @returns {JSX.Element} Two select components to switch between fieldName and directionNames
 * @example
 *  <SortControl<FlowSummary>
 *        records={flows}
 *        setRecords={setFlows}
 *       sortOptions={sortOptions}
 *     />
 */
export const SortControl = <T extends object>({
  records,
  setRecords,
  sortOptions,
}: {
  records: T[];
  setRecords: React.Dispatch<React.SetStateAction<T[] | null>>;
  sortOptions: SortableFields<T>[];
}) => {
  const route = useCurrentRoute();

  const { sortObject: initialSortObject, sortDirection: initialSortDirection } =
    getSortParams(route.url.query, sortOptions);

  const [selectedSort, setSelectedSort] =
    useState<SortableFields<T>>(initialSortObject);
  const [sortDirection, setSortDirection] =
    useState<SortDirection>(initialSortDirection);

  const navigation = useNavigation();
  const selectedDisplaySlug = slugify(selectedSort.displayName);

  const sortOptionsMap = useMemo(() => {
    return Object.groupBy(sortOptions, ({ displayName }) =>
      slugify(displayName),
    );
  }, [sortOptions]);

  useEffect(() => {
    const updateSortParam = (sortOption: string) => {
      const searchParams = new URLSearchParams(route.url.search);
      searchParams.set("sort", sortOption);
      searchParams.set("sortDirection", sortDirection);
      navigation.navigate(
        {
          pathname: window.location.pathname,
          search: `?${searchParams.toString()}`,
        },
        {
          replace: true,
        },
      );
    };

    updateSortParam(selectedDisplaySlug);
  }, [navigation, route.url.search, selectedDisplaySlug, sortDirection]);

  useEffect(() => {
    const { fieldName } = selectedSort;
    const sortedFlowsNullsLast = orderBy(
      records,
      [(flow) => get(flow, fieldName) || ""],
      sortDirection,
    );
    setRecords(sortedFlowsNullsLast);
  }, [selectedSort, sortDirection, records, setRecords]);

  return (
    <Box display={"flex"} gap={1} alignItems="center">
      <SelectInput
        visuallyHiddenLabel
        value={selectedDisplaySlug}
        size="small"
        onChange={(e) => {
          const targetKey = e.target.value as string;
          const matchingSortOption = sortOptionsMap[targetKey];
          if (!matchingSortOption) return;
          setSelectedSort(matchingSortOption?.[0]);
        }}
      >
        {sortOptions.map(({ displayName }) => (
          <MenuItem key={slugify(displayName)} value={slugify(displayName)}>
            {displayName}
          </MenuItem>
        ))}
      </SelectInput>
      <SelectInput
        value={sortDirection}
        size="small"
        onChange={(e) => {
          const newDirection = e.target.value as SortDirection;
          setSortDirection(newDirection);
        }}
      >
        <MenuItem key={slugify(selectedSort.directionNames.asc)} value={"asc"}>
          {selectedSort.directionNames.asc}
        </MenuItem>
        <MenuItem
          key={slugify(selectedSort.directionNames.desc)}
          value={"desc"}
        >
          {selectedSort.directionNames.desc}
        </MenuItem>
      </SelectInput>
    </Box>
  );
};

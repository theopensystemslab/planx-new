import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import { get, orderBy } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { useCurrentRoute, useNavigation } from "react-navi";
import { Paths } from "type-fest";
import { slugify } from "utils";

import SelectInput from "./SelectInput/SelectInput";

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
  const [selectedSort, setSelectedSort] = useState<SortableFields<T>>(
    sortOptions[0],
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const navigation = useNavigation();
  const route = useCurrentRoute();
  const selectedDisplaySlug = slugify(selectedSort.displayName);

  const sortOptionsMap = useMemo(() => {
    return Object.groupBy(sortOptions, ({ displayName }) =>
      slugify(displayName),
    );
  }, [sortOptions]);

  const updateSortParam = (sortOption: string) => {
    const searchParams = new URLSearchParams();
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

  const parseStateFromURL = () => {
    console.log("Sort control parse");
    const { sort: sortParam, sortDirection: sortDirectionParam } =
      route.url.query;
    const matchingSortOption = sortOptionsMap[sortParam];
    if (!matchingSortOption) return;
    setSelectedSort(matchingSortOption[0]);
    if (sortDirectionParam === "asc" || sortDirectionParam === "desc") {
      setSortDirection(sortDirection);
    }
  };

  useEffect(() => {
    parseStateFromURL();
  }, []);

  useEffect(() => {
    const { fieldName } = selectedSort;
    const sortNewFlows = orderBy(records, fieldName, sortDirection);
    setRecords(sortNewFlows);
    updateSortParam(selectedDisplaySlug);
  }, [selectedSort, sortDirection]);

  return (
    <Box display={"flex"}>
      <SelectInput
        value={selectedDisplaySlug}
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

import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import { styled } from "@mui/material/styles";
import { get, orderBy } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { useCurrentRoute, useNavigation } from "react-navi";
import { Paths } from "type-fest";
import { slugify } from "utils";

import SelectInput from "./SelectInput/SelectInput";

type SortDirection = "asc" | "desc";

const StyledSelectInput = styled(SelectInput)(({ theme }) => ({
  borderColor: theme.palette.border.input,
  minWidth: "170px",
}));

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
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const navigation = useNavigation();
  const route = useCurrentRoute();
  const selectedDisplaySlug = slugify(selectedSort.displayName);

  const sortOptionsMap = useMemo(() => {
    return Object.groupBy(sortOptions, ({ displayName }) =>
      slugify(displayName),
    );
  }, [sortOptions]);

  const updateSortParam = (sortOption: string) => {
    // Create URLSearchParams from current search string to preserve other params
    const searchParams = new URLSearchParams(route.url.search);
    // Update or add new params
    searchParams.set("sort", sortOption);
    searchParams.set("sortDirection", sortDirection);

    navigation.navigate(
      {
        pathname: window.location.pathname,
        search: searchParams.toString(), // Don't concatenate, just use the new params
      },
      {
        replace: true,
      },
    );
  };

  const parseStateFromURL = () => {
    const urlParams = route.url.query;
    const matchingSortOption = sortOptionsMap[urlParams.sort];

    if (!matchingSortOption) return;
    setSelectedSort(matchingSortOption[0]);

    if (
      urlParams.sortDirection === "asc" ||
      urlParams.sortDirection === "desc"
    ) {
      setSortDirection(urlParams.sortDirection); // Use the URL param value, not the state
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
    <Box display={"flex"} gap={1}>
      <StyledSelectInput
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
      </StyledSelectInput>
      <StyledSelectInput
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
      </StyledSelectInput>
    </Box>
  );
};

import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import { get } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { useCurrentRoute, useNavigation } from "react-navi";
import { Paths } from "type-fest";
import { slugify } from "utils";

import SelectInput from "./SelectInput/SelectInput";

type SortDirection = "asc" | "desc";

export interface SortableFields<T> {
  displayName: string;
  fieldName: Paths<T>;
}

const compareValues = (
  a: string | boolean,
  b: string | boolean,
  sortDirection: SortDirection,
) => {
  if (a < b) {
    return sortDirection === "asc" ? 1 : -1;
  }
  if (a > b) {
    return sortDirection === "asc" ? -1 : 1;
  }
  return 0;
};

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
    return sortOptions.reduce(
      (acc, option) => ({
        ...acc,
        [slugify(option.displayName)]: option,
      }),
      {} as Record<string, SortableFields<T>>,
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

  useEffect(() => {
    const { sort: sortParam, sortDirection: sortDirectionParam } =
      route.url.query;
    const matchingSortOption = sortOptionsMap[sortParam];
    matchingSortOption && setSelectedSort(matchingSortOption);
    if (sortDirectionParam === "asc" || sortDirectionParam === "desc") {
      setSortDirection(sortDirection);
    }
  }, []);

  useEffect(() => {
    const { fieldName } = selectedSort;
    const sortedFlows = records?.sort((a: T, b: T) =>
      compareValues(get(a, fieldName), get(b, fieldName), sortDirection),
    );
    sortedFlows && setRecords([...sortedFlows]);
    updateSortParam(selectedDisplaySlug);
  }, [selectedSort, sortDirection]);

  return (
    <Box display={"flex"}>
      <SelectInput
        value={selectedDisplaySlug}
        onChange={(e) => {
          const targetKey = e.target.value as string;
          const matchingSortOption = sortOptionsMap[targetKey];
          matchingSortOption && setSelectedSort(matchingSortOption);
        }}
      >
        {sortOptions.map(({ displayName }) => (
          <MenuItem key={slugify(displayName)} value={slugify(displayName)}>
            {displayName}
          </MenuItem>
        ))}
      </SelectInput>
      <IconButton
        title="ordering"
        aria-label="ordering"
        onClick={() =>
          sortDirection === "asc"
            ? setSortDirection("desc")
            : setSortDirection("asc")
        }
      >
        {sortDirection === "asc" ? <TrendingUpIcon /> : <TrendingDownIcon />}
      </IconButton>
    </Box>
  );
};

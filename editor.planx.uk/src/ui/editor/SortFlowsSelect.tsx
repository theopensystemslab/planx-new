import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import {
  FlowSummary,
  FlowSummaryOperations,
  PublishedFlowSummary,
} from "pages/FlowEditor/lib/store/editor";
import React, { useEffect, useState } from "react";
import { useNavigation } from "react-navi";

import SelectInput from "./SelectInput/SelectInput";

type SortDirection = "asc" | "desc";
type SortKeys = keyof FlowSummary;
type SortNestedKeys = keyof PublishedFlowSummary | keyof FlowSummaryOperations;
type SortTypes = SortKeys | SortNestedKeys;

interface BasicSort {
  displayName: string;
  sortKey: Exclude<SortKeys, "publishedFlows" | "operations">;
}

interface PublishedFlowSort {
  displayName: string;
  sortKey: "publishedFlows";
  nestedKey: keyof PublishedFlowSummary;
}

type SortObject = PublishedFlowSort | BasicSort;

const sortArray: SortObject[] = [
  { displayName: "Name", sortKey: "name" },
  { displayName: "Last updated", sortKey: "updatedAt" },
  { displayName: "Status", sortKey: "status" },
  {
    displayName: "Last published",
    sortKey: "publishedFlows",
    nestedKey: "publishedAt",
  },
];

const sortFlowList = (
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

export const SortFlowsSelect = ({
  flows,
  setFlows,
}: {
  flows: FlowSummary[];
  setFlows: React.Dispatch<React.SetStateAction<FlowSummary[] | null>>;
}) => {
  const [sortBy, setSortBy] = useState<SortObject>(sortArray[0]);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const navigation = useNavigation();

  const addToSearchParams = (sortKey: SortTypes) => {
    navigation.navigate(
      {
        pathname: window.location.pathname,
        search: `?sort=${sortKey}`,
      },
      {
        replace: true,
      },
    );
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlSort = params.get("sort") as SortTypes;
    const newSortObj = sortArray.find(
      (sort) =>
        sort.sortKey === urlSort ||
        (sort.sortKey === "publishedFlows" && sort.nestedKey === urlSort),
    );
    newSortObj && setSortBy(newSortObj);
  }, []);

  useEffect(() => {
    const { sortKey } = sortBy;

    if (sortKey === "publishedFlows") {
      const sortedFlows = flows?.sort((a: FlowSummary, b: FlowSummary) => {
        const { nestedKey } = sortBy;

        // auto sort unpublished flows to bottom
        if (!a[sortKey][0]) return 1;
        if (!b[sortKey][0]) return -1;

        const aValue = a[sortKey][0][nestedKey];
        const bValue = b[sortKey][0][nestedKey];

        return sortFlowList(aValue, bValue, sortDirection);
      });
      sortedFlows && setFlows([...sortedFlows]);
      addToSearchParams(sortBy.nestedKey);
    } else {
      const sortedFlows = flows?.sort((a: FlowSummary, b: FlowSummary) =>
        sortFlowList(a[sortKey], b[sortKey], sortDirection),
      );
      sortedFlows && setFlows([...sortedFlows]);
      addToSearchParams(sortBy.sortKey);
    }
  }, [sortBy, sortDirection]);

  return (
    <Box display={"flex"}>
      <SelectInput
        value={sortBy.sortKey}
        onChange={(e) => {
          const targetKey = e.target.value as SortTypes;
          const newSortObject = sortArray.find(
            (sortObject) => sortObject.sortKey === targetKey,
          );
          newSortObject && setSortBy(newSortObject);
        }}
      >
        {sortArray.map(({ displayName, sortKey }) => (
          <MenuItem key={sortKey} value={sortKey}>
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

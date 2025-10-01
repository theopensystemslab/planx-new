import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import { styled } from "@mui/material/styles";
import { useNavigate } from "@tanstack/react-router";
import React from "react";
import { slugify } from "utils";

import SelectInput from "../SelectInput/SelectInput";
import { SortableFields } from "./SortControl";

type SortDirection = "asc" | "desc";

const StyledSelectInput = styled(SelectInput)(() => ({
  minWidth: "170px",
  height: "40px",
}));

export interface TanStackSortControlProps<T> {
  sortOptions: SortableFields<T>[];
  currentSort: string;
  currentDirection: SortDirection;
  routePath: string;
}

/**
 * @component
 * @description TanStack Router compatible sort control component
 * @param {Type} T - a type to define the shape of the data being sorted
 * @param {Array} props.sortOptions - An array of objects to define displayName, fieldName, and directionNames
 * @param {string} props.currentSort - Current sort parameter from URL
 * @param {SortDirection} props.currentDirection - Current sort direction from URL
 * @param {string} props.routePath - The route path for navigation
 * @returns {JSX.Element} Two select components to switch between fieldName and directionNames
 * @example
 *  <TanStackSortControl<FlowSummary>
 *        sortOptions={sortOptions}
 *        currentSort="last-edited"
 *        currentDirection="desc"
 *        routePath="/_authenticated/$team/"
 *     />
 */
export const TanStackSortControl = <T extends object>({
  sortOptions,
  currentSort,
  currentDirection,
  routePath,
}: TanStackSortControlProps<T>) => {
  const navigate = useNavigate();

  // Find the current sort option object
  const currentSortOption =
    sortOptions.find((option) => slugify(option.displayName) === currentSort) ||
    sortOptions[0];

  const handleSortChange = (newSort: string) => {
    navigate({
      to: routePath,
      search: {
        sort: newSort,
        sortDirection: currentDirection,
      },
      replace: true,
    });
  };

  const handleDirectionChange = (newDirection: SortDirection) => {
    navigate({
      to: routePath,
      search: {
        sort: currentSort,
        sortDirection: newDirection,
      },
      replace: true,
    });
  };

  return (
    <Box display={"flex"} gap={1}>
      <StyledSelectInput
        visuallyHiddenLabel
        value={currentSort}
        onChange={(e) => {
          const targetSort = e.target.value as string;
          handleSortChange(targetSort);
        }}
      >
        {sortOptions.map(({ displayName }) => {
          const sortValue = slugify(displayName);
          return (
            <MenuItem key={sortValue} value={sortValue}>
              {displayName}
            </MenuItem>
          );
        })}
      </StyledSelectInput>
      <StyledSelectInput
        value={currentDirection}
        onChange={(e) => {
          const newDirection = e.target.value as SortDirection;
          handleDirectionChange(newDirection);
        }}
      >
        <MenuItem value="asc">{currentSortOption.directionNames.asc}</MenuItem>
        <MenuItem value="desc">
          {currentSortOption.directionNames.desc}
        </MenuItem>
      </StyledSelectInput>
    </Box>
  );
};

import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import { useNavigate, useSearch } from "@tanstack/react-router";
import React from "react";
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
 * @description URL-controlled sort component that updates search params
 * @param {Type} T - a type to define the shape of the data
 * @param {Array} props.sortOptions - An array of objects to define displayName, fieldName, and directionNames
 * @returns {JSX.Element} Two select components to switch between fieldName and directionNames
 * @example
 *  <SortControl<FlowSummary>
 *       sortOptions={sortOptions}
 *     />
 */
export const SortControl = <T extends object>({
  sortOptions,
}: {
  sortOptions: SortableFields<T>[];
}) => {
  const searchParams = useSearch({ from: "/_authenticated/team/$team/" });
  const navigate = useNavigate();

  const { sortObject: currentSortObject, sortDirection: currentSortDirection } =
    getSortParams(searchParams || {}, sortOptions);

  const selectedDisplaySlug = slugify(currentSortObject.displayName);

  const handleSortChange = (newSortSlug: string) => {
    navigate({
      to: ".",
      search: (prev) => ({
        ...prev,
        sort: newSortSlug as "name" | "last-edited" | "last-published",
      }),
      replace: true,
    });
  };

  const handleDirectionChange = (newDirection: SortDirection) => {
    navigate({
      to: ".",
      search: (prev) => ({
        ...prev,
        sortDirection: newDirection,
      }),
      replace: true,
    });
  };

  return (
    <Box display={"flex"} gap={1} alignItems="center">
      <SelectInput
        visuallyHiddenLabel
        value={selectedDisplaySlug}
        size="small"
        onChange={(e) => {
          handleSortChange(e.target.value as string);
        }}
      >
        {sortOptions.map(({ displayName }) => (
          <MenuItem key={slugify(displayName)} value={slugify(displayName)}>
            {displayName}
          </MenuItem>
        ))}
      </SelectInput>
      <SelectInput
        value={currentSortDirection}
        size="small"
        onChange={(e) => {
          handleDirectionChange(e.target.value as SortDirection);
        }}
      >
        <MenuItem
          key={slugify(currentSortObject.directionNames.asc)}
          value={"asc"}
        >
          {currentSortObject.directionNames.asc}
        </MenuItem>
        <MenuItem
          key={slugify(currentSortObject.directionNames.desc)}
          value={"desc"}
        >
          {currentSortObject.directionNames.desc}
        </MenuItem>
      </SelectInput>
    </Box>
  );
};

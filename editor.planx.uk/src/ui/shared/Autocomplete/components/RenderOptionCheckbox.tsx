import { AutocompleteRenderOptionState } from "@mui/material/Autocomplete";
import ListItem from "@mui/material/ListItem";
import React, { ComponentProps } from "react";

import { CustomCheckbox } from "../styles";

interface RenderCheckboxProps {
  listProps: React.ComponentPropsWithoutRef<"li">;
  displayName: string;
  state: AutocompleteRenderOptionState;
  checkboxProps?: ComponentProps<typeof CustomCheckbox>;
}

export const RenderOptionCheckbox = ({
  listProps: { key, ...restListProps },
  displayName,
  state,
  checkboxProps,
}: RenderCheckboxProps) => {
  return (
    <ListItem key={key} {...restListProps}>
      <CustomCheckbox
        aria-hidden="true"
        aria-selected={state.selected}
        className={state.selected ? "selected" : ""}
        {...checkboxProps}
      />
      {displayName}
    </ListItem>
  );
};

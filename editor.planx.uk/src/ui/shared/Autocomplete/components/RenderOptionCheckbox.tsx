import { AutocompleteRenderOptionState } from "@mui/material/Autocomplete";
import ListItem from "@mui/material/ListItem";
import React, { ComponentProps, HTMLAttributes } from "react";

import { CustomCheckbox } from "../styles";

interface RenderCheckboxProps {
  listProps: HTMLAttributes<HTMLLIElement>;
  displayName: string;
  state: AutocompleteRenderOptionState;
  checkboxProps?: ComponentProps<typeof CustomCheckbox>;
}

export const RenderOptionCheckbox = ({
  listProps,
  displayName,
  state,
  checkboxProps,
}: RenderCheckboxProps) => {
  return (
    <ListItem {...listProps}>
      <CustomCheckbox
        aria-hidden="true"
        className={state.selected ? "selected" : ""}
        {...checkboxProps}
      />
      {displayName}
    </ListItem>
  );
};

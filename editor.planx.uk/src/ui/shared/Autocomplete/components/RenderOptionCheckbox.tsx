import { AutocompleteRenderOptionState } from "@mui/material/Autocomplete";
import ListItem from "@mui/material/ListItem";
import React, { HTMLAttributes } from "react";

import { CustomCheckbox } from "../styles";

interface RenderCheckboxProps {
  listProps: HTMLAttributes<HTMLLIElement>;
  displayName: string;
  state: AutocompleteRenderOptionState;
}

export const RenderOptionCheckbox = ({
  listProps,
  displayName,
  state,
}: RenderCheckboxProps) => {
  return (
    <ListItem {...listProps}>
      <CustomCheckbox
        aria-hidden="true"
        className={state.selected ? "selected" : ""}
      />
      {displayName}
    </ListItem>
  );
};

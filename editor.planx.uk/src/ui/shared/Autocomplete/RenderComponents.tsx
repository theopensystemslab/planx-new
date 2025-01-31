import {
  AutocompleteRenderGroupParams,
  AutocompleteRenderInputParams,
  AutocompleteRenderOptionState,
} from "@mui/material/Autocomplete";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListSubheader from "@mui/material/ListSubheader";
import Typography from "@mui/material/Typography";
import React, { HTMLAttributes } from "react";
import { CustomCheckbox } from "ui/shared/SelectMultiple";

import { StyledDataField, StyledTextField } from "./styles";

interface RenderCheckboxProps {
  listProps: HTMLAttributes<HTMLLIElement>;
  displayName: string;
  state: AutocompleteRenderOptionState;
}

interface RenderFieldInput {
  params: AutocompleteRenderInputParams;
  label?: string;
  required: boolean;
  placeholder?: string;
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

export const RenderGroup = ({
  params,
  displayName,
}: {
  params: AutocompleteRenderGroupParams;
  displayName: string;
}) => {
  return (
    <List
      key={`group-${params.key}`}
      role="group"
      sx={{ paddingY: 0 }}
      aria-labelledby={`${params.group}-label`}
    >
      <ListSubheader
        id={`${params.group}-label`}
        role="presentation"
        disableSticky
        sx={(theme) => ({
          borderTop: 1,
          borderColor: theme.palette.border.main,
        })}
      >
        <Typography py={1} variant="subtitle2" component="h4">
          {displayName}
        </Typography>
      </ListSubheader>
      {params.children}
    </List>
  );
};

export const RenderDataFieldInput = ({
  params,
  label,
  required,
  placeholder,
}: RenderFieldInput) => {
  return (
    <StyledDataField
      {...params}
      InputProps={{
        ...params.InputProps,
        notched: false,
      }}
      label={label}
      placeholder={placeholder}
      required={required}
    />
  );
};

export const RenderTextFieldInput = ({
  params,
  label,
  required,
  placeholder,
}: RenderFieldInput) => {
  return (
    <StyledTextField
      {...params}
      InputProps={{
        ...params.InputProps,
        notched: false,
      }}
      label={label}
      placeholder={placeholder}
      required={required}
    />
  );
};

import React from "react";
import { MenuItem } from "@material-ui/core";
import trim from "lodash/trim";
import flags from "../../data/flags";
import { SelectInput, SelectInputProps } from "../../../../ui";

export interface IEditor {
  headerTextField?: string;
  whyItMatters?: string;
  policyField?: string;
  definition?: string;
  notes?: string;
}

const renderMenuItem = (category: string) => {
  return flags
    .filter((flag) => flag.category === category)
    .map((flag, index) => (
      <MenuItem key={index} value={flag.value}>
        {flag.text}
      </MenuItem>
    ));
};

export const PermissionSelect: React.FC<SelectInputProps> = (props) => (
  <SelectInput {...props}>
    {props.value && <MenuItem value="">Remove Flag</MenuItem>}
    <MenuItem disabled>Planning permission</MenuItem>
    {renderMenuItem("Planning permission")}
    <MenuItem disabled>Listed building consent</MenuItem>
    {renderMenuItem("Listed building consent")}
    <MenuItem disabled>Works to trees</MenuItem>
    {renderMenuItem("Works to trees")}
    <MenuItem disabled>Demolition in a conservation area</MenuItem>
    {renderMenuItem("Demolition in a conservation area")}
    <MenuItem disabled>Planning policy</MenuItem>
    {renderMenuItem("Planning policy")}
    <MenuItem disabled>Community infrastructure levy</MenuItem>
    {renderMenuItem("Community infrastructure levy")}
  </SelectInput>
);

export const parseFormValues = (ob, defaultValues = {}) =>
  ob.reduce((acc, [k, v]) => {
    if (typeof v === "string") {
      // Remove trailing lines (whitespace)
      // and non-ASCII characters https://stackoverflow.com/a/44472084
      v = trim(v).replace(/[\u{0080}-\u{FFFF}]/gu, "");
      // don't store empty fields
      if (v) acc[k] = v;
    } else if (Array.isArray(v)) {
      // if it's an array (i.e. options)
      acc[k] = v
        // only store fields that have values
        .map((o) => parseFormValues(Object.entries(o)))
        // don't store options with no values
        .filter((o) => Object.keys(o).length > 0);
    } else {
      // it's a number or boolean etc
      acc[k] = v;
    }
    return acc;
  }, defaultValues);

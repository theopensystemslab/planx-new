import {
  AutocompleteChangeReason,
  AutocompleteProps,
} from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import ListItem from "@mui/material/ListItem";
import { Flag, flatFlags } from "@opensystemslab/planx-core/types";
import React, { useMemo } from "react";
import InputRow from "ui/shared/InputRow";
import { CustomCheckbox, SelectMultiple } from "ui/shared/SelectMultiple";

interface Props {
  value?: Array<Flag["value"]>;
  onChange: (values: Array<Flag["value"]>) => void;
}

const renderOptions: AutocompleteProps<
  Flag,
  true,
  true,
  false,
  "div"
>["renderOption"] = (props, flag, { selected }) => (
  <ListItem {...props}>
    <CustomCheckbox
      aria-hidden="true"
      className={selected ? "selected" : ""}
      sx={{ backgroundColor: `${flag.bgColor}` }}
    />
    {flag.text}
  </ListItem>
);

const renderTags: AutocompleteProps<
  Flag,
  true,
  true,
  false,
  "div"
>["renderTags"] = (value, getFlagProps) =>
  value.map((flag, index) => (
    <Chip
      {...getFlagProps({ index })}
      key={flag.value}
      label={flag.text}
      sx={{ backgroundColor: flag.bgColor, color: flag.color }}
    />
  ));

export const FlagsSelect: React.FC<Props> = (props) => {
  const { value: initialFlagValues } = props;

  const value: Flag[] | undefined = useMemo(
    () =>
      initialFlagValues?.flatMap((initialFlagValue) =>
        flatFlags.filter((flag) => flag.value === initialFlagValue),
      ),
    [initialFlagValues],
  );

  const handleChange = (
    _event: React.SyntheticEvent,
    value: Flag[],
    _reason: AutocompleteChangeReason,
  ) => {
    const selectedFlags = value.map((flag) => flag.value);
    props.onChange(selectedFlags);
  };

  return (
    <InputRow>
      <SelectMultiple
        id="select-multiple-flags"
        key="select-multiple-flags"
        placeholder="Flags (up to one per category)"
        options={flatFlags}
        getOptionLabel={(flag) => flag.text}
        groupBy={(flag) => flag.category}
        onChange={handleChange}
        isOptionEqualToValue={(flag, value) => flag.value === value.value}
        value={value}
        renderOption={renderOptions}
        renderTags={renderTags}
      />
    </InputRow>
  );
};

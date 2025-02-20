import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import { GridFilterFormProps } from "@mui/x-data-grid";
import React from "react";
import {
  OptionalAutocompleteProps,
  RequiredAutocompleteProps,
  StyledAutocomplete,
} from "ui/shared/SelectMultiple";

type Props<T> = RequiredAutocompleteProps<T> &
  OptionalAutocompleteProps<T> &
  GridFilterFormProps & { applyValue: (args: Record<string, any>) => void };

export function MultipleOptionSelectFilter<T>(props: Props<T>) {
  const { item, applyValue } = props;

  const [chipData, setChipData] = React.useState(item.value);

  return (
    <FormControl sx={{ display: "flex", flexDirection: "column" }}>
      <StyledAutocomplete
        role="status"
        aria-atomic={true}
        aria-live="polite"
        disableCloseOnSelect
        multiple
        renderInput={(params) => (
          <TextField
            {...params}
            InputLabelProps={{
              shrink: true,
            }}
            label="Option"
            variant="standard"
            InputProps={{
              ...params.InputProps,
            }}
          />
        )}
        ChipProps={{
          variant: "uploadedFileTag",
          size: "small",
          onDelete: (event) => {
            const element = event.currentTarget;
            const chipIndex = Number(
              element.parentElement.getAttribute("data-tag-index"),
            );
            setChipData((prev: string[]) => {
              prev.splice(chipIndex, 1);
            });
            applyValue({ ...item, chipData });
            setChipData(item.value);
          },
        }}
        options={props.options}
        onChange={(_e, value) => {
          setChipData(value);
          return applyValue({ ...item, value });
        }}
        value={item.value}
      />
    </FormControl>
  );
}

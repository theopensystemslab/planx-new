import Box from "@mui/material/Box";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import React, { useEffect, useState } from "react";

export const DoubleInputFilter = (
  props: Record<string, any>,
): React.JSX.Element | null => {
  const { item, applyValue, type, focusElementRef, valueOptions } = props;

  const [filterValueState, setFilterValueState] = useState<[string, string]>(
    item.value ?? "",
  );

  useEffect(() => {
    const itemValue = item.value ?? [undefined, undefined];
    setFilterValueState(itemValue);
  }, [item.value]);

  const updateFilterValue = (firstInput: string, secondInput: string) => {
    setFilterValueState([firstInput, secondInput]);
    applyValue({ ...item, value: [firstInput, secondInput] });
  };

  const handleFirstFilterChange: TextFieldProps["onChange"] = (event) => {
    const newSecondInput = event.target.value;
    updateFilterValue(filterValueState[0], newSecondInput);
  };
  const handleSecondFilterChange: TextFieldProps["onChange"] = (event) => {
    const newFirstInput = event.target.value;
    updateFilterValue(newFirstInput, filterValueState[1]);
  };

  return (
    <Box
      sx={{
        display: "inline-flex",
        flexDirection: "row",
        alignItems: "end",
        pl: "10px",
      }}
    >
      <TextField
        id={`contains-input-${item.id}`}
        value={filterValueState[0]}
        onChange={handleSecondFilterChange}
        type={type || "text"}
        variant="standard"
        InputLabelProps={{
          shrink: true,
        }}
        label="Option 1"
        inputRef={focusElementRef}
        select
        SelectProps={{
          native: true,
        }}
      >
        {valueOptions.map((option: string) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </TextField>
      <TextField
        id={`contains-input-${item.id}`}
        value={filterValueState[1]}
        onChange={handleFirstFilterChange}
        type={type || "text"}
        variant="standard"
        InputLabelProps={{
          shrink: true,
        }}
        label="Option 2"
        select
        SelectProps={{
          native: true,
        }}
      >
        {valueOptions.map((option: string) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </TextField>
    </Box>
  );
};

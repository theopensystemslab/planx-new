import TextField from "@mui/material/TextField";
import React from "react";

export const SingleInputFilter = (
  props: Record<string, any>,
): React.JSX.Element | null => {
  const { item, applyValue, type, focusElementRef, valueOptions } = props;

  return (
    <TextField
      id={`contains-input-${item.id}`}
      value={item.value}
      onChange={(event) => applyValue({ ...item, value: event.target.value })}
      type={type || "text"}
      variant="standard"
      InputLabelProps={{
        shrink: true,
      }}
      label="Option"
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
  );
};

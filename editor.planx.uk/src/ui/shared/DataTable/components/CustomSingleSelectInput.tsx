import FormLabel from "@mui/material/FormLabel";
import TextField from "@mui/material/TextField";
import React from "react";

export const CustomSingleSelectInput = (
  props: Record<string, any>,
): React.JSX.Element | null => {
  const { item, applyValue, type, focusElementRef, valueOptions } = props;

  return (
    <>
      <FormLabel className="MuiInputLabel-root MuiInputLabel-formControl MuiInputLabel-animated MuiInputLabel-shrink MuiInputLabel-sizeMedium MuiInputLabel-standard MuiFormLabel-colorPrimary MuiFormLabel-filled   css-pl6ypn-MuiFormLabel-root-MuiInputLabel-root">
        Service name
      </FormLabel>
      <TextField
        sx={{ marginTop: "-10px" }}
        id={`contains-input-${item.id}`}
        value={item.value}
        onChange={(event) => applyValue({ ...item, value: event.target.value })}
        type={type || "text"}
        variant="standard"
        InputLabelProps={{
          shrink: true,
        }}
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
    </>
  );
};

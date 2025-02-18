// import SyncIcon from "@mui/icons-material/Sync";
import Box from "@mui/material/Box";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { useGridRootProps } from "@mui/x-data-grid";
import React, { useEffect, useRef, useState } from "react";

export const CustomSingleSelectInput = (
  props: Record<string, any>,
): React.JSX.Element | null => {
  const rootProps = useGridRootProps();
  const { item, applyValue, type, focusElementRef, valueOptions } = props;

  // const filterTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [filterValueState, setFilterValueState] = useState<[string, string]>(
    item.value ?? "",
  );
  const [applying, setIsApplying] = useState(false);

  // useEffect(() => {
  //   return () => {
  //     clearTimeout(filterTimeout.current);
  //   };
  // }, []);

  useEffect(() => {
    const itemValue = item.value ?? [undefined, undefined];
    setFilterValueState(itemValue);
  }, [item.value]);

  const updateFilterValue = (lowerBound: string, upperBound: string) => {
    // clearTimeout(filterTimeout.current);
    setFilterValueState([lowerBound, upperBound]);

    setIsApplying(true);
    // filterTimeout.current = setTimeout(() => {
    setIsApplying(false);
    applyValue({ ...item, value: [lowerBound, upperBound] });
    // }, rootProps.filterDebounceMs);
  };

  const handleUpperFilterChange: TextFieldProps["onChange"] = (event) => {
    const newUpperBound = event.target.value;
    updateFilterValue(filterValueState[0], newUpperBound);
  };
  const handleLowerFilterChange: TextFieldProps["onChange"] = (event) => {
    const newLowerBound = event.target.value;
    updateFilterValue(newLowerBound, filterValueState[1]);
  };

  return (
    <Box
      sx={{
        display: "inline-flex",
        flexDirection: "row",
        alignItems: "end",
        pl: "20px",
      }}
    >
      {/* <FormLabel className={muiFormLabelClasses}>Service name</FormLabel> need dynamic name! */}
      <TextField
        id={`contains-input-${item.id}`}
        // value={item.value}
        value={filterValueState[0]}
        // onChange={(event) => applyValue({ ...item, value: event.target.value })}
        onChange={handleLowerFilterChange}
        type={type || "text"}
        variant="standard"
        InputLabelProps={{
          shrink: true,
        }}
        label="bla"
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
        // sx={{ marginTop: "-10px" }}
        id={`contains-input-${item.id}`}
        // value={item.value}
        // onChange={(event) => applyValue({ ...item, value: event.target.value })}
        value={filterValueState[1]}
        onChange={handleUpperFilterChange}
        type={type || "text"}
        variant="standard"
        InputLabelProps={{
          shrink: true,
        }}
        label="bla2"
        select
        SelectProps={{
          native: true,
        }}
        // InputProps={applying ? { endAdornment: <SyncIcon /> } : {}}
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

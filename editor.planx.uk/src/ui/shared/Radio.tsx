import Box from "@mui/material/Box";
import React from "react";

import OptionButton from "../editor/OptionButton";

interface RadioProps<T> {
  value?: T;
  options: Array<{ label: string; value: T }>;
  onChange: (newValue: T) => void;
}

export default function Radio<T>(props: RadioProps<T>) {
  return (
    <Box sx={{ maxWidth: "fit-content", "& button": { width: "100% " } }}>
      {props.options.map((option, index) => (
        <OptionButton
          selected={props.value === option.value}
          key={index}
          onClick={() => {
            props.onChange(option.value);
          }}
        >
          {option.label}
        </OptionButton>
      ))}
    </Box>
  );
}

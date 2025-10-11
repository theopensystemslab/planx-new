import InputAdornment from "@mui/material/InputAdornment";
import { typographyClasses } from "@mui/material/Typography";
import React, { useState } from "react";

/**
 * InputAdornment for text inputs displaying the current URL
 * Used to display URLs when creating teams and flows
 */
export const URLPrefix: React.FC = () => {
  // Store in component state so this does not update when user submits form
  const [urlPrefix] = useState(() => {
    const { origin, pathname } = window.location;
    const path = pathname !== "/" ? pathname : "";
    return `${origin}${path}/`;
  });

  return (
    <InputAdornment
      position="start"
      sx={(theme) => ({
        mr: 0,
        [`& .${typographyClasses.root}`]: {
          color: theme.palette.text.disabled,
        },
      })}
    >
      {urlPrefix}
    </InputAdornment>
  );
};

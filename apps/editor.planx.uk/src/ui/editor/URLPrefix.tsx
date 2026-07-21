import InputAdornment from "@mui/material/InputAdornment";
import { typographyClasses } from "@mui/material/Typography";
import React, { useState } from "react";

type Props = {
  mode: "team" | "flow";
};

/**
 * InputAdornment for text inputs displaying the current URL
 * Used to display URLs when creating teams and flows
 */
export const URLPrefix: React.FC<Props> = ({ mode }) => {
  // Store in component state so this does not update when user submits form
  const [urlPrefix] = useState(() => {
    const { origin, pathname } = window.location;
    const path = mode === "team" ? pathname : pathname.replace("/flows", ""); // if creating a new flow, the route of the flow itself should not be a child of `/flows`
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

import InputAdornment from "@mui/material/InputAdornment";
import { typographyClasses } from "@mui/material/Typography";
import { useParams } from "@tanstack/react-router";
import React, { useState } from "react";

type Props = {
  mode: "team" | "flow";
};

const getPath = (mode: Props["mode"], team?: string) => {
  switch (mode) {
    case "team":
      return "/app";
    case "flow":
      return `/app/${team}`;
  }
};

/**
 * InputAdornment for text inputs displaying the current URL
 * Used to display URLs when creating teams and flows
 */
export const URLPrefix: React.FC<Props> = ({ mode }) => {
  const { team } = useParams({ strict: false });

  // Store in component state so this does not update when user submits form
  const [urlPrefix] = useState(() => {
    const path = getPath(mode, team);
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

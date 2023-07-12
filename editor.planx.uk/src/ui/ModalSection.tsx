import Box from "@mui/material/Box";
import { makeStyles } from "@mui/styles";
import React, { ReactNode } from "react";

import type { Theme } from "../theme";

const useClasses = makeStyles((theme: Theme) => ({
  section: {
    paddingBottom: theme.spacing(3),
    "& + $section": {
      borderTop: `0.5px solid #bbb`,
    },
  },
}));

export default function ModalSection({
  children,
}: {
  children: ReactNode;
}): FCReturn {
  const classes = useClasses();
  return <Box className={classes.section}>{children}</Box>;
}

import Box from "@mui/material/Box";
import makeStyles from "@mui/styles/makeStyles";
import React, { ReactNode } from "react";

const useClasses = makeStyles((theme) => ({
  label: {
    flexShrink: 1,
    flexGrow: 0,
    paddingRight: theme.spacing(2),
    "&:not(:first-child)": {
      paddingLeft: theme.spacing(2),
    },
  },
}));

export default function InputRowLabel({ children }: { children: ReactNode }) {
  const classes = useClasses();
  return (
    <Box alignSelf="center" className={classes.label}>
      {children}
    </Box>
  );
}

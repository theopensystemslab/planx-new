import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
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

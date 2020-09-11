import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";

const inputRowLabelStyles = makeStyles((theme) => ({
  label: {
    flexShrink: 1,
    flexGrow: 0,
    paddingRight: theme.spacing(2),
    "&:not(:first-child)": {
      paddingLeft: theme.spacing(2),
    },
  },
}));

const InputRowLabel = ({ children }) => {
  const classes = inputRowLabelStyles();
  return (
    <Box alignSelf="center" className={classes.label}>
      {children}
    </Box>
  );
};

export default InputRowLabel;

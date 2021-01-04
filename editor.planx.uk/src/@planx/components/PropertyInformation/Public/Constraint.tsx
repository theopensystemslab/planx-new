import Box from "@material-ui/core/Box";
import { useTheme } from "@material-ui/core/styles";
import React from "react";

import { constraintsStyles } from "./styles";

const Constraint = ({ children, color, ...props }: any) => {
  const classes = constraintsStyles();
  const theme = useTheme();
  return (
    <Box
      className={classes.constraint}
      bgcolor={color ? color : "background.paper"}
      color={
        color
          ? theme.palette.getContrastText(color)
          : theme.palette.text.primary
      }
      {...props}
    >
      {children}
    </Box>
  );
};
export default Constraint;

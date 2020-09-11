import Box from "@material-ui/core/Box";
import React from "react";

import { makeStyles } from "@material-ui/core/styles";

const modalSectionStyles = makeStyles((theme) => ({
  section: {
    paddingBottom: theme.spacing(3),
    "& + $section": {
      borderTop: `0.5px solid #bbb`,
    },
  },
}));

export default ({ children }) => {
  const classes = modalSectionStyles();
  return <Box className={classes.section}>{children}</Box>;
};

import Box from "@material-ui/core/Box";
import makeStyles from "@material-ui/core/styles/makeStyles";
import React from "react";

const modalSectionStyles = makeStyles((theme) => ({
  section: {
    paddingBottom: theme.spacing(3),
    "& + $section": {
      borderTop: `0.5px solid #bbb`,
    },
  },
}));

const ModalSection = ({ children }) => {
  const classes = modalSectionStyles();
  return <Box className={classes.section}>{children}</Box>;
};

export default ModalSection;

import { Box, makeStyles, Theme } from "@material-ui/core";
import React from "react";

const useStyles = makeStyles<Theme>(() => ({
  container: {
    "& > * + *": {
      marginTop: 20,
    },
  },
}));

const Card: React.FC<any> = ({ children, ...props }) => {
  const classes = useStyles();
  return (
    <Box
      className={classes.container}
      bgcolor="background.default"
      py={{ xs: 2, md: 4 }}
      px={{ xs: 2, md: 5 }}
      mb={4}
      width="100%"
      maxWidth={768}
      {...props}
    >
      {children}
    </Box>
  );
};
export default Card;

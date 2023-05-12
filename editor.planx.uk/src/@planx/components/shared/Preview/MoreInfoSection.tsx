import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

const infoSectionStyles = makeStyles((theme) => ({
  root: {
    "& + $root": {
      paddingTop: theme.spacing(3),
      borderTop: `1px solid ${theme.palette.text.primary}`,
    },
  },
  title: {
    paddingBottom: theme.spacing(4),
  },
  content: {
    "& img, & p": {
      marginBottom: "1rem",
      marginTop: 0,
    },
    "& strong": {
      fontWeight: FONT_WEIGHT_SEMI_BOLD,
    },
    "& em": {
      fontStyle: "italic",
    },
  },
}));

interface IMoreInfoSection {
  title?: string;
  children: JSX.Element[] | JSX.Element;
}

const MoreInfoSection: React.FC<IMoreInfoSection> = ({ title, children }) => {
  const classes = infoSectionStyles();
  return (
    <Box className={classes.root} pb={3}>
      {title && (
        <Typography className={classes.title} variant="h3" component="h2">
          {title}
        </Typography>
      )}
      <Box className={classes.content}>{children}</Box>
    </Box>
  );
};

export default MoreInfoSection;

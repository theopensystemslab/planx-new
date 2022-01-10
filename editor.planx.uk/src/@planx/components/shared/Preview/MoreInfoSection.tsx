import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React from "react";

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
      fontWeight: 700,
    },
    "& em": {
      fontStyle: "italic",
    },
    "& a": {
      color: theme.palette.text.primary,
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

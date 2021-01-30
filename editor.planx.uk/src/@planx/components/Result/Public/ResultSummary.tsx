import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import classNames from "classnames";
import React from "react";

const resultSummaryStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
    width: "100%",
    minHeight: theme.spacing(10),
  },
  defaultColor: {
    backgroundColor: theme.palette.background.paper,
    color: "currentColor",
  },
  description: {
    textAlign: "left",
    fontSize: 15,
    "& a": {
      textDecoration: "underline",
      cursor: "pointer",
      color: "currentColor",
      "&:hover": {
        textDecoration: "none",
      },
    },
    "& p": {
      marginTop: 0,
      marginBottom: 10,
      "&:last-child": {
        marginBottom: 0,
      },
    },
    "& strong": {
      fontWeight: 700,
    },
  },
}));

const ResultSummary = ({ heading, subheading, children, color }: any) => {
  const classes = resultSummaryStyles();
  return (
    <Box
      className={classNames(classes.root, !color && classes.defaultColor)}
      bgcolor={color && color.background}
      color={color && color.text}
      textAlign="center"
      px={2}
      py={6}
    >
      <Typography variant="h1" gutterBottom>
        {heading}
      </Typography>
      {subheading && (
        <Typography variant="h5" gutterBottom>
          {subheading}
        </Typography>
      )}
      <Box className={classes.description}>{children}</Box>
    </Box>
  );
};

export default ResultSummary;

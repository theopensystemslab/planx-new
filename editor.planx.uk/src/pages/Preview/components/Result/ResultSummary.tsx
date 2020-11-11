import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { fade } from "@material-ui/core/styles/colorManipulator";
import Typography from "@material-ui/core/Typography";
import HelpIcon from "@material-ui/icons/HelpOutlineOutlined";
import classNames from "classnames";
import React from "react";

const resultSummaryStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
    width: "100%",
    borderTopWidth: "10px",
    borderTopStyle: "solid",
    minHeight: theme.spacing(10),
    marginBottom: theme.spacing(3),
  },
  defaultColor: {
    backgroundColor: theme.palette.background.paper,
    color: "currentColor",
  },
  helpIcon: {
    position: "absolute",
    right: theme.spacing(2),
    top: theme.spacing(2),
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

const ResultSummary = ({ heading, subheading, children, color }) => {
  const theme = useTheme();
  const classes = resultSummaryStyles();
  return (
    <Box
      className={classNames(classes.root, !color && classes.defaultColor)}
      bgcolor={color && color.background}
      color={color && color.text}
      borderColor={fade(color ? color.text : theme.palette.text.primary, 0.4)}
      textAlign="center"
      px={2}
      pt={6}
      pb={2}
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

      <IconButton className={classes.helpIcon} color="inherit">
        <HelpIcon />
      </IconButton>
    </Box>
  );
};

export default ResultSummary;

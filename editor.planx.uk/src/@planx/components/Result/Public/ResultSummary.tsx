import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
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
    marginTop: theme.spacing(4),
  },
}));

const ResultSummary = ({ heading, description, children, color }: any) => {
  const classes = resultSummaryStyles();

  return (
    <Box
      className={classNames(classes.root, !color && classes.defaultColor)}
      bgcolor={color && color.background}
      color={color && color.text}
      display="flex"
      justifyContent="center"
      textAlign="center"
      px={2}
      py={6}
    >
      <Container maxWidth="md">
        <Typography variant="h1" gutterBottom>
          {heading}
        </Typography>
        {description && (
          <Typography
            variant="body1"
            align="left"
            gutterBottom
            className={classes.description}
          >
            {description}
          </Typography>
        )}
      </Container>
    </Box>
  );
};

export default ResultSummary;

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React from "react";
import Banner from "ui/Banner";

const resultSummaryStyles = makeStyles((theme) => ({
  description: {
    marginTop: theme.spacing(4),
  },
}));

const ResultSummary = ({ heading, description, color }: any) => {
  const classes = resultSummaryStyles();

  return (
    <Banner heading={heading} color={color}>
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
    </Banner>
  );
};

export default ResultSummary;

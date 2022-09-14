import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
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

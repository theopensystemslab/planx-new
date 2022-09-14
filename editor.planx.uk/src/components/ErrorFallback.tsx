import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
import Card from "@planx/components/shared/Preview/Card";
import React from "react";

import { airbrake } from "../airbrake";

const useStyles = makeStyles((theme) => ({
  errorSummary: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(3),
    border: `5px solid #E91B0C`,
  },
}));

function ErrorFallback(props: { error: Error }) {
  console.error(props.error);
  airbrake?.notify(props.error);

  const classes = useStyles();

  return (
    <Card>
      <div className={classes.errorSummary} role="alert">
        <Typography variant="h5" component="h1" gutterBottom>
          Something went wrong
        </Typography>
        <Typography>
          {props.error?.message && (
            <pre style={{ color: "#E91B0C" }}>{props.error.message}</pre>
          )}
        </Typography>
        <Typography variant="body2">
          This bug has been automatically logged and our team will see it soon.
        </Typography>
      </div>
    </Card>
  );
}

export default ErrorFallback;

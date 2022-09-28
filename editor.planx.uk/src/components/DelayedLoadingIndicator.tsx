import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
import React, { useEffect, useState } from "react";

const useClasses = makeStyles({
  container: {
    padding: 60,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    marginLeft: "1rem",
  },
});

const DelayedLoadingIndicator: React.FC<{
  msDelayBeforeVisible?: number;
  text?: string;
}> = ({ msDelayBeforeVisible = 0, text }) => {
  const [visible, setVisible] = useState(false);

  const classes = useClasses();

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), msDelayBeforeVisible);
    return () => {
      clearTimeout(timeout);
    };
  }, [msDelayBeforeVisible]);

  return visible ? (
    <div
      className={classes.container}
      role="alert"
      aria-busy="true"
      aria-live="assertive"
    >
      <CircularProgress aria-label="Loading" />
      <Typography variant="body2" className={classes.text}>
        {text ?? "Loading…"}
      </Typography>
    </div>
  ) : null;
};

export default DelayedLoadingIndicator;

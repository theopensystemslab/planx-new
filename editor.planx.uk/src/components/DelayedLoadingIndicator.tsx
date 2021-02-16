import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
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
}> = ({ msDelayBeforeVisible = 50, text }) => {
  const [visible, setVisible] = useState(false);

  const classes = useClasses();

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), msDelayBeforeVisible);
    return () => {
      clearTimeout(timeout);
    };
  }, [msDelayBeforeVisible]);

  return visible ? (
    <div className={classes.container}>
      <CircularProgress />
      <Typography variant="body2" className={classes.text}>
        {text ?? "Loading…"}
      </Typography>
    </div>
  ) : null;
};

export default DelayedLoadingIndicator;

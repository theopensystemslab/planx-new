import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";
import React, { useEffect, useState } from "react";

const useClasses = makeStyles({
  container: {
    padding: 60,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  children: {
    marginLeft: "1rem",
  },
});

const DelayedLoadingIndicator: React.FC<{
  msDelayBeforeVisible?: number;
  children?: React.ReactNode;
}> = ({ msDelayBeforeVisible = 50, children }) => {
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
      <div className={classes.children}>{children ?? "Loading…"}</div>
    </div>
  ) : null;
};

export default DelayedLoadingIndicator;

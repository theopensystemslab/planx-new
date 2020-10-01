import React, { useEffect, useState } from "react";
import { CircularProgress, makeStyles } from "@material-ui/core";

const useClasses = makeStyles({
  container: {
    padding: 60,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

const DelayedLoadingIndicator: React.FC<{ msDelayBeforeVisible: number }> = ({
  msDelayBeforeVisible = 0,
}) => {
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
    </div>
  ) : null;
};

export default DelayedLoadingIndicator;

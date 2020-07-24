import React, { useEffect, useState } from "react";

const DelayedLoadingIndicator: React.FC<{ msDelayBeforeVisible: number }> = ({
  msDelayBeforeVisible = 0,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), msDelayBeforeVisible);
    return () => {
      clearTimeout(timeout);
    };
  }, [msDelayBeforeVisible]);

  return visible ? <h1>Loading</h1> : null;
};

export default DelayedLoadingIndicator;

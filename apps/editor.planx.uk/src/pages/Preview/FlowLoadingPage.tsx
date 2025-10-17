import { isEmpty } from "lodash";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { PropsWithChildren } from "react";

const FlowLoadingPage: React.FC<PropsWithChildren<{ message?: string }>> = ({
  children,
  message = "Loading service data...",
}) => {
  const flow = useStore((state) => state.flow);

  if (isEmpty(flow)) return message;

  return children;
};

export default FlowLoadingPage;

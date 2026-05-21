import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import FlowCopy from "./FlowCopy";
import FlowStatus from "./FlowStatus";
import IsService from "./IsService";
import { useGetIsService } from "./IsService/queries";
import LPSListing from "./LPS";

const VisibilitySettings: React.FC = () => {
  const flowId = useStore((state) => state.id);
  const { data: isServiceData } = useGetIsService(flowId);
  const isService = isServiceData?.flow.isService;

  return (
    <>
      <IsService />
      {isService && <FlowStatus />}
      <FlowCopy />
      {isService && <LPSListing />}
    </>
  );
};

export default VisibilitySettings;

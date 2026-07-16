import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import ErrorSummary from "ui/shared/ErrorSummary/ErrorSummary";

import FlowCopy from "./FlowCopy";
import FlowStatus from "./FlowStatus";
import IsService from "./IsService";
import { useGetIsService } from "./IsService/queries";
import LPSListing from "./LPS";

const VisibilitySettings: React.FC = () => {
  const [flowId, isPattern] = useStore((state) => [state.id, state.isPattern]);
  const { data: isServiceData, loading, error } = useGetIsService(flowId);

  if (loading) return <DelayedLoadingIndicator />;
  if (error) return <ErrorSummary message={error.message} />;
  if (!isServiceData?.flow)
    return <ErrorSummary message="Flow data not found" />;

  const isService = isServiceData.flow.isService;

  return (
    <>
      {!isPattern && <IsService />}
      {(isService || isPattern) && <FlowStatus />}
      {!isPattern && <FlowCopy isService={isService} />}
      {isService && <LPSListing />}
    </>
  );
};

export default VisibilitySettings;

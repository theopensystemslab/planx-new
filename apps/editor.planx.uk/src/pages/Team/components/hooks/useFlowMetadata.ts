import { FlowSummary } from "pages/FlowEditor/lib/store/editor";
import { useMemo } from "react";
import { StatusVariant } from "ui/editor/FlowTag/types";

export const useFlowMetadata = (flow: FlowSummary) => {
  return useMemo(() => {
    const isSubmissionService = flow.publishedFlows?.[0]?.hasSendComponent;
    const isTemplatedFlow = Boolean(flow.templatedFrom);
    const isSourceTemplate = flow.isTemplate;
    const isAnyTemplate = isTemplatedFlow || isSourceTemplate;
    const statusVariant =
      flow.status === "online" ? StatusVariant.Online : StatusVariant.Offline;

    return {
      isSubmissionService,
      isTemplatedFlow,
      isSourceTemplate,
      isAnyTemplate,
      statusVariant,
    };
  }, [flow]);
};

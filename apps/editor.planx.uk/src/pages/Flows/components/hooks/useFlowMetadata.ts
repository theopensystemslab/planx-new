import type { FlowSummary } from "pages/FlowEditor/lib/store/editor";
import { useMemo } from "react";
import { StatusVariant } from "ui/editor/FlowTag/types";

export const useFlowMetadata = (flow: FlowSummary) => {
  return useMemo(() => {
    const hasSendComponent = flow.publishedFlows?.[0]?.hasSendComponent;
    const isTemplatedFlow = Boolean(flow.templatedFrom);
    const isSourceTemplate = flow.isTemplate;
    const isAnyTemplate = isTemplatedFlow || isSourceTemplate;
    const isService = flow.isService;
    const statusVariant =
      flow.status === "online" ? StatusVariant.Online : StatusVariant.Offline;
    const isPattern = flow.isPattern;

    return {
      hasSendComponent,
      isTemplatedFlow,
      isSourceTemplate,
      isService,
      isAnyTemplate,
      statusVariant,
      isPattern,
    };
  }, [flow]);
};

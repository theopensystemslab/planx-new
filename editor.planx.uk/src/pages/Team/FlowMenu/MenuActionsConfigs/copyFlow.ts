import { useStore } from "pages/FlowEditor/lib/store";
import { FlowSummary } from "pages/FlowEditor/lib/store/editor";

export const getCopyFlowConfig = (
  flowId: FlowSummary["id"],
  refreshFlows: () => void,
) => {
  const { copyFlow } = useStore.getState();

  const handleCopy = () => {
    copyFlow(flowId).then(() => {
      refreshFlows();
    });
  };

  return {
    label: "Copy",
    onClick: () => {
      handleCopy();
    },
  };
};

import { useStore } from "pages/FlowEditor/lib/store";
import { FlowSummary } from "pages/FlowEditor/lib/store/editor";

export const copyFlow = (flow: FlowSummary, refreshFlows: () => void) => {
  const { copyFlow } = useStore.getState();

  const handleCopy = () => {
    copyFlow(flow.id).then(() => {
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

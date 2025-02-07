import { useStore } from "pages/FlowEditor/lib/store";
import { FlowSummary } from "pages/FlowEditor/lib/store/editor";
import { slugify } from "utils";

export const getMoveFlowConfig = (
  flowId: FlowSummary["id"],
  flowName: FlowSummary["name"],
  refreshFlows: () => void,
) => {
  const { moveFlow, teamSlug } = useStore.getState();

  const handleMove = (newTeam: string) => {
    moveFlow(flowId, newTeam, flowName).then(() => {
      refreshFlows();
    });
  };

  return {
    label: "Move",
    onClick: () => {
      const newTeam = prompt(
        "Enter the destination team's slug. A slug is the URL name of a team, for example 'Barking & Dagenham' would be 'barking-and-dagenham'. ",
      );
      if (newTeam) {
        if (slugify(newTeam) === teamSlug) {
          alert(`This flow already belongs to ${teamSlug}, skipping move`);
        } else {
          handleMove(slugify(newTeam));
        }
      }
    },
  };
};

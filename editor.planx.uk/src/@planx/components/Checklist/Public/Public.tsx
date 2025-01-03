import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import { PublicChecklistProps } from "../types";
import { AutoAnsweredChecklist } from "./components/AutoAnsweredChecklist";
import { Checklist } from "./components/Checklist";
import { GroupedChecklist } from "./components/GroupedChecklist";

const ChecklistComponent: React.FC<PublicChecklistProps> = (props) => {
  const autoAnswerableOptions = useStore(
    (state) => state.autoAnswerableOptions
  );
  const { groupedOptions, options } = props;

  if (props.neverAutoAnswer) {
    return (
      <>
        {groupedOptions && <GroupedChecklist {...props} />}
        {options && <Checklist {...props} />}
      </>
    );
  }

  let idsThatCanBeAutoAnswered: string[] | undefined;
  if (props.id) idsThatCanBeAutoAnswered = autoAnswerableOptions(props.id);
  if (idsThatCanBeAutoAnswered) {
    return (
      <AutoAnsweredChecklist {...props} answerIds={idsThatCanBeAutoAnswered} />
    );
  }

  return (
    <>
      {groupedOptions && <GroupedChecklist {...props} />}
      {options && <Checklist {...props} />}
    </>
  );
};

export default ChecklistComponent;

import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import { Option } from "../../shared";
import { Props } from "../types";
import { AutoAnsweredChecklist } from "./components/AutoAnsweredChecklist";
import { VisibleChecklist } from "./components/VisibleChecklist";

const ChecklistComponent: React.FC<Props> = (props) => {
  const autoAnswerableOptions = useStore(
    (state) => state.autoAnswerableOptions
  );

  if (props.neverAutoAnswer) {
    return <VisibleChecklist {...props} />;
  }

  let idsThatCanBeAutoAnswered: string[] | undefined;
  if (props.id) idsThatCanBeAutoAnswered = autoAnswerableOptions(props.id);
  if (idsThatCanBeAutoAnswered) {
    return (
      <AutoAnsweredChecklist {...props} answerIds={idsThatCanBeAutoAnswered} />
    );
  }

  return <VisibleChecklist {...props} />;
};

export default ChecklistComponent;
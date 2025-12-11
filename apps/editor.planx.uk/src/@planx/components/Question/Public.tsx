import React, { useEffect } from "react";

import BaseQuestionComponent from "../shared/BaseQuestion/Public";
import { PublicProps } from "../shared/types";
import { QuestionWithOptions } from "./model";

const QuestionComponent: React.FC<PublicProps<QuestionWithOptions>> = (
  props,
) => {
  const { options, autoAnswers, handleSubmit } = props;

  // Questions without edges act like "sticky notes" in the graph for editors only & should be auto-answered
  const isStickyNote = !options.length;

  // Auto-answered Questions still set a breadcrumb even though they render null
  useEffect(() => {
    if (isStickyNote || autoAnswers) {
      handleSubmit?.({
        answers: autoAnswers,
        auto: true,
      });
    }
  }, [isStickyNote, autoAnswers, handleSubmit]);

  // Auto-answered Questions are not publicly visible
  if (isStickyNote || props.autoAnswers) return null;

  return <BaseQuestionComponent {...props} />;
};

export default QuestionComponent;

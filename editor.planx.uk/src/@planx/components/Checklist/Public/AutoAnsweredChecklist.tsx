import React, { useEffect } from "react";

import { Props } from "../types";

// An auto-answered Checklist won't be seen by the user, but still leaves a breadcrumb
export const AutoAnsweredChecklist: React.FC<
  Props & { answerIds: string[] }
> = (props) => {
  useEffect(() => {
    props.handleSubmit?.({
      answers: props.answerIds,
      auto: true,
    });
  }, [props]);

  return null;
};

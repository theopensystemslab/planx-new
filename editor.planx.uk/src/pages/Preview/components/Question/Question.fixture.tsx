import React from "react";

import Question from "./Question";

export default (
  <Question
    text="To be (murderer) or not to be"
    description="That is the question"
    info="Some info here"
    policyRef="Policy ref here"
    howMeasured="How is it measured"
    responses={[
      {
        id: "a",
        responseKey: "a",
        title: "Yes",
        description: "Yes, I'll be a murderer",
      },
      {
        id: "b",
        responseKey: "b",
        title: "No",
        description: "No, I shan't",
      },
    ]}
    handleSubmit={window.alert}
  />
);

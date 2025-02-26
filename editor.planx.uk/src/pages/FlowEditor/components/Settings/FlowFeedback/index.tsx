import React from "react";

import { FeedbackLog } from "../../Flow/FeedbackLog/FeedbackLog";

export const FlowFeedback: React.FC<any> = ({ feedback }) => {
  return <FeedbackLog feedback={feedback} />;
};

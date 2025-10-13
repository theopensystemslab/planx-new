import React from "react";
import CheckCircleIcon from "ui/icons/CheckCircle";
import SlashCircleIcon from "ui/icons/SlashCircle";

import SemanticIcon from "./SemanticIcon";

interface Props {
  isCompleted: boolean;
  title: {
    complete: string;
    incomplete: string;
  };
}

export const StatusIcon: React.FC<Props> = ({ isCompleted, title }) => (
  <SemanticIcon
    Icon={isCompleted ? CheckCircleIcon : SlashCircleIcon}
    titleAccess={isCompleted ? title.complete : title.incomplete}
    data-testid={isCompleted ? "complete-icon" : "incomplete-icon"}
    color={isCompleted ? "success" : "disabled"}
    fontSize="large"
  />
);

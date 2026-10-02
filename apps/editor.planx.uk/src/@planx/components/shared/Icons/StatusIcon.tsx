import CheckCircleIcon from "ui/icons/CheckCircle";
import DashedCircleIcon from "ui/icons/DashedCircle";

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
    Icon={isCompleted ? CheckCircleIcon : DashedCircleIcon}
    titleAccess={isCompleted ? title.complete : title.incomplete}
    data-testid={isCompleted ? "complete-icon" : "incomplete-icon"}
    color={isCompleted ? "success" : "disabled"}
    fontSize="large"
  />
);

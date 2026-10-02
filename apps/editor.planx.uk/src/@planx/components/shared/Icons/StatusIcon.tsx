import { IconCircleCheckFilled, IconForbidFilled } from "@tabler/icons-react";

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
    Icon={isCompleted ? IconCircleCheckFilled : IconForbidFilled}
    titleAccess={isCompleted ? title.complete : title.incomplete}
    data-testid={isCompleted ? "complete-icon" : "incomplete-icon"}
    color={isCompleted ? "success" : "disabled"}
    fontSize="large"
  />
);

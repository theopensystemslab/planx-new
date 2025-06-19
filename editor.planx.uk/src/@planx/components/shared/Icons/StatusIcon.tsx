import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { svgIconClasses } from "@mui/material/SvgIcon";
import React from "react";

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
    Icon={isCompleted ? CheckCircleIcon : RemoveCircleOutlineIcon}
    titleAccess={isCompleted ? title.complete : title.incomplete}
    data-testid={isCompleted ? "complete-icon" : "incomplete-icon"}
    color={isCompleted ? "success" : "disabled"}
    fontSize="large"
    sx={{
      ...(!isCompleted && {
        [`&.${svgIconClasses.root}`]: {
          transform: "rotate(-45deg)",
        },
      }),
    }}
  />
);

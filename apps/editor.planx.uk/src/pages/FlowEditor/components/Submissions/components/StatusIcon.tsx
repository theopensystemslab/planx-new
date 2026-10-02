import {
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconDotsCircleHorizontal,
} from "@tabler/icons-react";
import { Icon } from "ui/icons/Icon";

import type { Submission } from "../types";

interface Props {
  status: Submission["status"];
}

const StatusIconMap: Record<
  NonNullable<Submission["status"]>,
  React.ReactElement
> = {
  Success: (
    <Icon icon={IconCircleCheckFilled} color="success" fontSize="medium" />
  ),
  Submitted: (
    <Icon icon={IconCircleCheckFilled} color="success" fontSize="medium" />
  ),
  Failed: <Icon icon={IconCircleXFilled} color="error" fontSize="medium" />,
  "Failed (500)": (
    <Icon icon={IconCircleXFilled} color="error" fontSize="medium" />
  ),
  "Failed (502)": (
    <Icon icon={IconCircleXFilled} color="error" fontSize="medium" />
  ),
  "Failed (503)": (
    <Icon icon={IconCircleXFilled} color="error" fontSize="medium" />
  ),
  "Failed (504)": (
    <Icon icon={IconCircleXFilled} color="error" fontSize="medium" />
  ),
  "Failed (400)": (
    <Icon icon={IconCircleXFilled} color="error" fontSize="medium" />
  ),
  "Failed (401)": (
    <Icon icon={IconCircleXFilled} color="error" fontSize="medium" />
  ),
  Started: (
    <Icon icon={IconDotsCircleHorizontal} color="info" fontSize="medium" />
  ),
  Capturable: (
    <Icon icon={IconDotsCircleHorizontal} color="warning" fontSize="medium" />
  ),
  Cancelled: (
    <Icon icon={IconCircleXFilled} color="disabled" fontSize="medium" />
  ),
  Error: <Icon icon={IconCircleXFilled} color="error" fontSize="medium" />,
  Unknown: <Icon icon={IconCircleXFilled} color="error" fontSize="medium" />,
};

export const StatusIcon: React.FC<Props> = ({ status }) => {
  if (!status) return null;
  return StatusIconMap[status] || null;
};

import SvgIcon, { type SvgIconProps } from "@mui/material/SvgIcon";
import React from "react";

interface Props extends SvgIconProps {
  Icon: typeof SvgIcon;
  titleAccess: string;
  ariaLabel?: string;
  role?: string;
}
const SemanticIcon: React.FC<Props> = ({ Icon, ...props }) => (
  <Icon {...props} />
);

export default SemanticIcon;

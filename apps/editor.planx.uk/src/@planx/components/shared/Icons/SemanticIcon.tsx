import type SvgIcon from "@mui/material/SvgIcon";
import { type SvgIconProps } from "@mui/material/SvgIcon";

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

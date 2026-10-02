import { type SvgIconProps } from "@mui/material/SvgIcon";
import { Icon, type TablerIcon } from "ui/icons/Icon";

interface Props extends SvgIconProps {
  Icon: TablerIcon;
  titleAccess: string;
  ariaLabel?: string;
  role?: string;
}
const SemanticIcon: React.FC<Props> = ({ Icon: icon, ...props }) => (
  <Icon icon={icon} {...props} />
);

export default SemanticIcon;

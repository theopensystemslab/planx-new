import { styled } from "@mui/material/styles";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import { IconChevronDownFilled } from "@tabler/icons-react";

import { Icon } from "./Icon";

interface Props extends SvgIconProps {
  expanded?: boolean;
}

const Root = styled(Icon, {
  shouldForwardProp: (prop) => prop !== "expanded",
})<Props>(({ expanded }) => ({
  ...(expanded && {
    transform: "rotate(180deg)",
  }),
}));

export default function Caret(props: Props) {
  return <Root icon={IconChevronDownFilled} {...props} />;
}

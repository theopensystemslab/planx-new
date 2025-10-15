import { styled } from "@mui/material/styles";
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";
import React from "react";

interface Props extends SvgIconProps {
  expanded?: boolean;
}

const Root = styled(SvgIcon, {
  shouldForwardProp: (prop) => prop !== "expanded",
})<Props>(({ expanded }) => ({
  height: 11,
  width: 22,
  ...(expanded && {
    transform: "rotate(180deg)",
  }),
}));

export default function Caret(props: Props) {
  return (
    <Root {...props} viewBox="0 0 14 8">
      <path
        d="M1 1L7 7L13 1"
        stroke="currentColor"
        strokeWidth="1.333px"
        fill="none"
      />
    </Root>
  );
}

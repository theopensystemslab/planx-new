import SvgIcon, { SvgIconProps } from "@material-ui/core/SvgIcon";
import React from "react";

export default function Caret(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 14 8">
      <path d="M1 1L7 7L13 1" stroke="black" fill="none" />
    </SvgIcon>
  );
}

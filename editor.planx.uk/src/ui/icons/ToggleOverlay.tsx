import { useTheme } from "@mui/material/styles";
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";
import * as React from "react";

export default function EditorIcon(props: SvgIconProps) {
  const theme = useTheme();
  const inactiveColor = theme.palette.text.disabled;

  return (
    <SvgIcon {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <polygon
        points="0 0 1.45 0 24 22.5 24 24 22.46 24 0 1.52 0 0"
        fill={inactiveColor}
      />
      <polygon points="1.45 0 4.48 0 24 19.55 24 22.5 1.45 0" fill="#fff" />
    </SvgIcon>
  );
}

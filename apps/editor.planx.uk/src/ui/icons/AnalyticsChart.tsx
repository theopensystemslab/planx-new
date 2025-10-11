import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";
import React from "react";

export default function AnalyticsChart(props: SvgIconProps) {
  return (
    <SvgIcon
      {...props}
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="9" y="17" width="5" height="14" fill="black" />
      <rect x="17" y="9" width="5" height="20" fill="black" />
      <rect x="25" y="13" width="5" height="12" fill="black" />
    </SvgIcon>
  );
}

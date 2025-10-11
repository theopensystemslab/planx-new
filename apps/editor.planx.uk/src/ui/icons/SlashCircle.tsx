import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";
import * as React from "react";

function SlashCircleIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path
        d="M17.66,6.34c-3.12-3.12-8.2-3.12-11.32,0s-3.12,8.2,0,11.32,8.2,3.12,11.32,0,3.12-8.2,0-11.32ZM9.17,16.24l-1.41-1.41,7.07-7.07,1.41,1.41-7.07,7.07Z"
        fill="none"
      />
      <rect
        x="7"
        y="11"
        width="10"
        height="2"
        transform="translate(-4.97 12) rotate(-45)"
      />
      <path d="M19.07,4.93c-3.9-3.9-10.24-3.9-14.15,0s-3.9,10.24,0,14.15c3.9,3.9,10.24,3.9,14.15,0s3.9-10.24,0-14.15ZM17.66,17.66c-3.12,3.12-8.2,3.12-11.32,0-3.12-3.12-3.12-8.2,0-11.32s8.2-3.12,11.32,0c3.12,3.12,3.12,8.2,0,11.32Z" />
    </SvgIcon>
  );
}

SlashCircleIcon.muiName = "SlashCircleIcon";

export default SlashCircleIcon;

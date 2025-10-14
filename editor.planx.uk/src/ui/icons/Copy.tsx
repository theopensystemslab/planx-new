import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";
import * as React from "react";

export default function CopyIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
      <path d="M13.69,17.39H3.85V4.26h-1.64v13.13c0,.9.74,1.64,1.64,1.64h9.85v-1.64ZM16.15,15.75c.9,0,1.64-.74,1.64-1.64V2.62c0-.9-.74-1.64-1.64-1.64H7.13c-.9,0-1.64.74-1.64,1.64v11.49c0,.9.74,1.64,1.64,1.64h9.03M16.15,14.11H7.13V2.62h9.03v11.49Z" />
    </SvgIcon>
  );
}

import SvgIcon, { SvgIconProps } from "@material-ui/core/SvgIcon";
import React from "react";

export default function Refresh(props: SvgIconProps & { title: string }) {
  return (
    <SvgIcon viewBox="0 0 32 32">
      <title>{props.title}</title>
      <path d="M18,28A12,12,0,1,0,6,16v6.2L2.4,18.6,1,20l6,6,6-6-1.4-1.4L8,22.2V16H8A10,10,0,1,1,18,26Z" />
    </SvgIcon>
  );
}

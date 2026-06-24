import { OverridableComponent } from "@mui/material/OverridableComponent";
import { SvgIconProps, SvgIconTypeMap } from "@mui/material/SvgIcon";
import React from "react";

import ModalSectionContent from "./ModalSectionContent";

interface Props {
  title?: string;
  subtitle?: string;
  children?: React.JSX.Element[] | React.JSX.Element;
  author?: string;
  Icon?:
    | React.ComponentType<SvgIconProps>
    | (OverridableComponent<SvgIconTypeMap<{}, "svg">> & { muiName: string });
}

export default function ModalComponentHeader(props: Props): FCReturn {
  return <ModalSectionContent {...props} isComponentHeader />;
}

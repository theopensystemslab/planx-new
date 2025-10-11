import React from "react";

import { Root } from "./styles";
import { FlowTagProps } from "./types";

const FlowTag: React.FC<FlowTagProps> = ({
  tagType,
  statusVariant,
  children,
}) => (
  <Root tagType={tagType} statusVariant={statusVariant}>
    {children}
  </Root>
);

export default FlowTag;

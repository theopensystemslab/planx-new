import Skeleton from "@mui/material/Skeleton";
import React from "react";

import { Root } from "./styles";
import { FlowTagProps } from "./types";

const FlowTag: React.FC<FlowTagProps> = ({
  tagType,
  statusVariant,
  children,
}) => {
  if (!statusVariant)
    return <Skeleton variant="rounded" width={65} height={24} />;

  return (
    <Root tagType={tagType} statusVariant={statusVariant}>
      {children}
    </Root>
  );
};

export default FlowTag;

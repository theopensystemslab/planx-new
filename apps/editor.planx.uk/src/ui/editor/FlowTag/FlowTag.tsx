import Skeleton from "@mui/material/Skeleton";
import React from "react";

import { Root } from "./styles";
import type { FlowTagProps } from "./types";
import { FlowTagType } from "./types";

const FlowTag: React.FC<FlowTagProps> = ({
  tagType,
  statusVariant,
  children,
}) => {
  if (tagType === FlowTagType.Status && !statusVariant)
    return <Skeleton variant="rounded" width={65} height={24} />;

  return (
    <Root tagType={tagType} statusVariant={statusVariant}>
      {children}
    </Root>
  );
};

export default FlowTag;

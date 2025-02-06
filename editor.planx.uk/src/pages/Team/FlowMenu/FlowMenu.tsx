import { styled } from "@mui/material/styles";
import { FlowSummary } from "pages/FlowEditor/lib/store/editor";
import React from "react";
import SimpleMenu from "ui/editor/SimpleMenu";

import { copyFlow } from "./MenuComponents/Copy";
import { deleteFlow } from "./MenuComponents/Delete";
import { moveFlow } from "./MenuComponents/Move";
import { renameFlow } from "./MenuComponents/Rename";

const StyledSimpleMenu = styled(SimpleMenu)(({ theme }) => ({
  display: "flex",
  borderLeft: `1px solid ${theme.palette.border.main}`,
}));

interface FlowMenuProps {
  flow: FlowSummary;
  flows: FlowSummary[];
  setDeleting: (value: React.SetStateAction<boolean>) => void;
  refreshFlows: () => void;
}

export const FlowMenu = ({
  flow,
  flows,
  setDeleting,
  refreshFlows,
}: FlowMenuProps) => {
  return (
    <StyledSimpleMenu
      items={[
        renameFlow(flow, flows, refreshFlows),
        copyFlow(flow, refreshFlows),
        moveFlow(flow, refreshFlows),
        deleteFlow(setDeleting),
      ]}
    />
  );
};

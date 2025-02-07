import { styled } from "@mui/material/styles";
import { FlowSummary } from "pages/FlowEditor/lib/store/editor";
import React from "react";
import SimpleMenu from "ui/editor/SimpleMenu";

import { getCopyFlowConfig } from "./MenuActionsConfigs/copyFlow";
import { getDeleteFlowConfig } from "./MenuActionsConfigs/deleteFlow";
import { getMoveFlowConfig } from "./MenuActionsConfigs/moveFlow";
import { getRenameFlowConfig } from "./MenuActionsConfigs/renameFlow";

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

export const FlowActionsMenu = ({
  flow,
  flows,
  setDeleting,
  refreshFlows,
}: FlowMenuProps) => {
  return (
    <StyledSimpleMenu
      items={[
        getRenameFlowConfig(flow.name, flow.slug, flows, refreshFlows),
        getCopyFlowConfig(flow.id, refreshFlows),
        getMoveFlowConfig(flow.id, flow.name, refreshFlows),
        getDeleteFlowConfig(setDeleting),
      ]}
    />
  );
};

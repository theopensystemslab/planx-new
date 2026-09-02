import Popover from "@mui/material/Popover";
import type { Graph } from "@planx/graph";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";
import type { NodeSearchParams } from "routes/_authenticated/app/$team/$flow/_flowEditor/nodes/route";
import { getNodeRoute } from "utils/routeUtils/utils";

import {
  COMPONENT_LIST_HEIGHT,
  COMPONENT_LIST_WIDTH,
  componentListFrameSx,
} from "./ComponentsTab";
import type { ModalTab } from "./ModalTabs";
import { ModalTabs } from "./ModalTabs";
import { DETAIL_PANEL_WIDTH } from "./PatternsTab/PatternDetailPanel";

interface Props {
  anchorEl: HTMLElement | null;
  parent?: string;
  before?: string;
  onClose: () => void;
}

const AddComponentModal: React.FC<Props> = ({
  anchorEl,
  parent,
  before,
  onClose,
}) => {
  const navigate = useNavigate();
  const { team, flow } = useParams({ from: "/_authenticated/app/$team/$flow" });

  const [activeTab, setActiveTab] = useState<ModalTab>("components");
  const popoverWidth =
    activeTab === "patterns"
      ? COMPONENT_LIST_WIDTH + DETAIL_PANEL_WIDTH
      : COMPONENT_LIST_WIDTH;

  const handleComponentSelect = (slug: string) => {
    onClose();
    navigate({
      to: getNodeRoute(parent, before),
      params: {
        team,
        flow,
        ...(parent && { parent }),
        ...(before && { before }),
      },
      search: { type: slug as NodeSearchParams["type"] },
    });
  };

  const handleInsertPattern = (graph: Graph) => {
    useStore.getState().insertPattern(graph, parent, before);
    onClose();
  };

  // Flip the popover above the hanger when there isn't room below it
  const rect = anchorEl?.getBoundingClientRect();
  const showBelow =
    !rect || window.innerHeight - rect.bottom >= COMPONENT_LIST_HEIGHT;

  return (
    <Popover
      open
      onClose={onClose}
      data-testid="add-component-modal"
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: showBelow ? "bottom" : "top",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: showBelow ? "top" : "bottom",
        horizontal: "center",
      }}
      disableScrollLock
      slotProps={{
        paper: {
          sx: {
            ...componentListFrameSx,
            width: popoverWidth,
            height: `min(${COMPONENT_LIST_HEIGHT}px, 85vh)`,
            mt: showBelow ? "4px" : "-4px",
          },
        },
        backdrop: {
          sx: { backgroundColor: "rgba(0, 0, 0, 0.3)" },
        },
      }}
    >
      <ModalTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onComponentSelect={handleComponentSelect}
        onInsertPattern={handleInsertPattern}
      />
    </Popover>
  );
};

export default AddComponentModal;

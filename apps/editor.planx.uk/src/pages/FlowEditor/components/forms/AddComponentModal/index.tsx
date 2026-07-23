import Popover from "@mui/material/Popover";
import { ROOT_NODE_KEY } from "@planx/graph";
import { useNavigate, useParams } from "@tanstack/react-router";
import { hasFeatureFlag } from "lib/featureFlags";
import { resolveNotePlacement } from "pages/FlowEditor/components/Flow/notes/lib/notePlacement";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useCallback, useState } from "react";
import type { NodeSearchParams } from "routes/_authenticated/app/$team/$flow/_flowEditor/nodes/route";
import { getNodeRoute } from "utils/routeUtils/utils";

import {
  COMPONENT_LIST_WIDTH,
  componentListFrameSx,
  ComponentsTab,
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
  const showPatterns = hasFeatureFlag("PATTERN_SELECT");

  const navigate = useNavigate();
  const { team, flow } = useParams({ from: "/_authenticated/app/$team/$flow" });
  const flowGraph = useStore((state) => state.flow);

  const [activeTab, setActiveTab] = useState<ModalTab>("components");
  const popoverWidth =
    showPatterns && activeTab === "patterns"
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

  const handleInsertPattern = (patternId: string) =>
    console.log(`Inserting pattern ${patternId}!`);

  const handleSelectNote = useCallback(() => {
    onClose();
    useStore.getState().openNoteEditor({
      mode: "create",
      placement: resolveNotePlacement(
        flowGraph,
        parent ?? ROOT_NODE_KEY,
        before,
      ),
    });
  }, [flowGraph, parent, before, onClose]);

  // Flip the popover above the hanger when there isn't room below it
  const rect = anchorEl?.getBoundingClientRect();
  const showBelow = !rect || window.innerHeight - rect.bottom >= 450;

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
            mt: showBelow ? "4px" : "-4px",
          },
        },
        backdrop: {
          sx: { backgroundColor: "rgba(0, 0, 0, 0.3)" },
        },
      }}
    >
      {showPatterns ? (
        <ModalTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onComponentSelect={handleComponentSelect}
          onSelectNote={hasFeatureFlag("NOTES") ? handleSelectNote : undefined}
          onInsertPattern={handleInsertPattern}
        />
      ) : (
        <ComponentsTab
          onSelect={handleComponentSelect}
          onSelectNote={hasFeatureFlag("NOTES") ? handleSelectNote : undefined}
        />
      )}
    </Popover>
  );
};

export default AddComponentModal;

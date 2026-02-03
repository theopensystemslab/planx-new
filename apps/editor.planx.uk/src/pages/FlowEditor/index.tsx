import "./floweditor.scss";

import Box from "@mui/material/Box";
import ButtonGroup from "@mui/material/ButtonGroup";
import { styled } from "@mui/material/styles";
import { MENU_WIDTH_COMPACT } from "components/EditorNavMenu/styles";
import { HEADER_HEIGHT_EDITOR } from "components/Header/Header";
import { isEmpty } from "lodash";
import { parentNodeIsTemplatedInternalPortal } from "pages/FlowEditor/utils";
import React, { useEffect, useRef } from "react";

import Flow from "./components/Flow";
import { getParentId } from "./components/Flow/lib/utils";
import { ToggleDataFieldsButton } from "./components/FlowEditor/ToggleDataFieldsButton";
import { ToggleHelpTextButton } from "./components/FlowEditor/ToggleHelpTextButton";
import { ToggleImagesButton } from "./components/FlowEditor/ToggleImagesButton";
import { ToggleNotesButton } from "./components/FlowEditor/ToggleNotesButton";
import { ToggleTagsButton } from "./components/FlowEditor/ToggleTagsButton";
import Sidebar from "./components/Sidebar";
import FlowSkeleton from "./FlowSkeleton";
import { useStore } from "./lib/store";
import useScrollControlsAndRememberPosition from "./lib/useScrollControlsAndRememberPosition";

const EditorContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "hasNavMenu",
})<{ hasNavMenu?: boolean }>(({ hasNavMenu = true }) => ({
  display: "flex",
  alignItems: "stretch",
  overflow: "hidden",
  flexGrow: 1,
  maxHeight: `calc(100vh - ${HEADER_HEIGHT_EDITOR}px)`,
  maxWidth: hasNavMenu ? `calc(100vw - ${MENU_WIDTH_COMPACT}px)` : "100vw",
}));

const EditorVisualControls = styled(ButtonGroup)(({ theme }) => ({
  position: "absolute",
  bottom: theme.spacing(2.5),
  left: theme.spacing(2.5),
  zIndex: theme.zIndex.appBar,
  border: `1px solid ${theme.palette.border.main}`,
  borderRadius: "3px",
  background: theme.palette.border.main,
  gap: "1px",
  overflow: "hidden",
}));

const FlowEditor = () => {
  const [
    flowObject,
    orderedFlow,
    isTemplatedFrom,
    teamSlug,
    flowId,
    connectToFlow,
    disconnectFromFlow,
    isNavMenuVisible,
  ] = useStore((state) => [
    state.flow,
    state.orderedFlow,
    state.isTemplatedFrom,
    state.getTeam().slug,
    state.id,
    state.connectToFlow,
    state.disconnectFromFlow,
    state.isNavMenuVisible,
  ]);

  useEffect(() => {
    if (!flowId) return;
    connectToFlow(flowId);

    return () => disconnectFromFlow();
  }, [flowId, connectToFlow, disconnectFromFlow]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isLoading = isEmpty(flowObject);
  useScrollControlsAndRememberPosition(isLoading ? null : scrollContainerRef);

  const parentId = getParentId(undefined);

  const indexedParent = orderedFlow?.find(({ id }) => id === parentId);
  const parentIsTemplatedInternalPortal = parentNodeIsTemplatedInternalPortal(
    flowObject,
    indexedParent,
  );

  const lockedFlow =
    !useStore.getState().canUserEditTeam(teamSlug) ||
    (isTemplatedFrom && !parentIsTemplatedInternalPortal);

  const showTemplatedNodeStatus =
    !lockedFlow && !parentIsTemplatedInternalPortal;

  return (
    <EditorContainer id="editor-container" hasNavMenu={isNavMenuVisible}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          overflowX: "auto",
          position: "relative",
        }}
      >
        <Box
          id="editor"
          ref={scrollContainerRef}
          className={lockedFlow ? "flow-locked" : ""}
        >
          {" "}
          {isLoading ? (
            <FlowSkeleton />
          ) : (
            <Flow
              lockedFlow={lockedFlow}
              showTemplatedNodeStatus={showTemplatedNodeStatus}
            />
          )}
          <EditorVisualControls
            orientation="vertical"
            aria-label="Toggle node attributes"
          >
            <ToggleImagesButton />
            <ToggleNotesButton />
            <ToggleHelpTextButton />
            <ToggleDataFieldsButton />
            <ToggleTagsButton />
          </EditorVisualControls>
        </Box>
      </Box>
      <Sidebar />
    </EditorContainer>
  );
};

export default FlowEditor;

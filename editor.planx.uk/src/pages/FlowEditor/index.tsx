import "./floweditor.scss";

import Box from "@mui/material/Box";
import ButtonGroup from "@mui/material/ButtonGroup";
import { styled } from "@mui/material/styles";
import React, { useRef } from "react";
import { rootFlowPath } from "routes/utils";

import Flow from "./components/Flow";
import { ToggleDataFieldsButton } from "./components/FlowEditor/ToggleDataFieldsButton";
import { ToggleHelpTextButton } from "./components/FlowEditor/ToggleHelpTextButton";
import { ToggleImagesButton } from "./components/FlowEditor/ToggleImagesButton";
import { ToggleTagsButton } from "./components/FlowEditor/ToggleTagsButton";
import Sidebar from "./components/Sidebar";
import { useStore } from "./lib/store";
import useScrollControlsAndRememberPosition from "./lib/useScrollControlsAndRememberPosition";

const EditorContainer = styled(Box)(() => ({
  display: "flex",
  alignItems: "stretch",
  overflow: "hidden",
  flexGrow: 1,
}));

const EditorVisualControls = styled(ButtonGroup)(({ theme }) => ({
  position: "fixed",
  bottom: theme.spacing(2.5),
  left: theme.spacing(7.5),
  zIndex: theme.zIndex.appBar,
  border: `1px solid ${theme.palette.border.main}`,
  borderRadius: "3px",
  background: theme.palette.border.main,
  gap: "1px",
  overflow: "hidden",
}));

const FlowEditor = () => {
  const flowPath = rootFlowPath(true).split("/")[2];
  const [flow, ...breadcrumbs] = flowPath.split(",");

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useScrollControlsAndRememberPosition(scrollContainerRef);

  const teamSlug = useStore.getState().getTeam().slug;
  const lockedFlow = !useStore.getState().canUserEditTeam(teamSlug);

  return (
    <EditorContainer id="editor-container">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          overflowX: "auto",
        }}
      >
        <Box
          id="editor"
          ref={scrollContainerRef}
          className={lockedFlow ? "flow-locked" : ""}
          sx={{ position: "relative" }}
        >
          <Flow flow={flow} breadcrumbs={breadcrumbs} />
          <EditorVisualControls
            orientation="vertical"
            aria-label="Toggle node attributes"
          >
            <ToggleImagesButton />
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

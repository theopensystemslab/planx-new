import "./floweditor.scss";

import Box from "@mui/material/Box";
import ButtonGroup from "@mui/material/ButtonGroup";
import { styled } from "@mui/material/styles";
import { HEADER_HEIGHT_EDITOR } from "components/Header/Header";
import React, { useRef } from "react";
import { rootFlowPath } from "routes/utils";

import Flow from "./components/Flow";
import { ToggleDataFieldsButton } from "./components/FlowEditor/ToggleDataFieldsButton";
import { ToggleImagesButton } from "./components/FlowEditor/ToggleImagesButton";
import { ToggleTagsButton } from "./components/FlowEditor/ToggleTagsButton";
import Sidebar from "./components/Sidebar";
import { useStore } from "./lib/store";
import useScrollControlsAndRememberPosition from "./lib/useScrollControlsAndRememberPosition";

const EditorContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isTestEnvBannerVisible",
})<{ isTestEnvBannerVisible?: boolean }>(({ isTestEnvBannerVisible }) => ({
  display: "flex",
  alignItems: "stretch",
  overflow: "hidden",
  flexGrow: 1,
  maxHeight: isTestEnvBannerVisible
    ? `calc(100vh - ${HEADER_HEIGHT_EDITOR * 2}px)`
    : `calc(100vh - ${HEADER_HEIGHT_EDITOR}px)`,
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

  const isTestEnvBannerVisible = useStore(
    (state) => state.isTestEnvBannerVisible,
  );

  return (
    <EditorContainer
      id="editor-container"
      isTestEnvBannerVisible={isTestEnvBannerVisible}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          overflowX: "auto",
        }}
      >
        <Box id="editor" ref={scrollContainerRef} sx={{ position: "relative" }}>
          <Flow flow={flow} breadcrumbs={breadcrumbs} />
          <EditorVisualControls
            orientation="vertical"
            aria-label="Toggle node attributes"
          >
            <ToggleImagesButton />
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

import "./floweditor.scss";

import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { HEADER_HEIGHT_EDITOR } from "components/Header";
import React, { useRef } from "react";
import { useCurrentRoute } from "react-navi";

import Flow from "./components/Flow";
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

const FlowEditor = () => {
  const [flow, ...breadcrumbs] =
    useCurrentRoute().url.pathname.split("/").at(-1)?.split(",") || [];

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
          <Box sx={{ display: "flex", flexDirection: "row" }}>
            <ToggleTagsButton />
            <ToggleImagesButton />
          </Box>
        </Box>
      </Box>
      <Sidebar />
    </EditorContainer>
  );
};

export default FlowEditor;

import "./floweditor.scss";

import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { HEADER_HEIGHT_EDITOR } from "components/Header";
import React, { useRef } from "react";
import { useCurrentRoute } from "react-navi";

import Flow from "./components/Flow";
import Sidebar from "./components/Sidebar";
import { useStore } from "./lib/store";
import useScrollControlsAndRememberPosition from "./lib/useScrollControlsAndRememberPosition";

const EditorContainer = styled(Box)(() => ({
  display: "flex",
  alignItems: "stretch",
  overflow: "hidden",
  flexGrow: 1,
  maxHeight: `calc(100vh - ${HEADER_HEIGHT_EDITOR}px)`,
}));

const FlowEditor = () => {
  const [flow, ...breadcrumbs] =
    useCurrentRoute().url.pathname.split("/").at(-1)?.split(",") || [];

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useScrollControlsAndRememberPosition(scrollContainerRef);
  const showSidebar = useStore((state) => state.showSidebar);

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
        <Box id="editor" ref={scrollContainerRef} sx={{ position: "relative" }}>
          <Flow flow={flow} breadcrumbs={breadcrumbs} />
        </Box>
      </Box>
      {showSidebar && <Sidebar />}
    </EditorContainer>
  );
};

export default FlowEditor;

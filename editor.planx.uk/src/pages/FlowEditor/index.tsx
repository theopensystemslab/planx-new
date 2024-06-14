import "./components/Settings";
import "./floweditor.scss";

import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import React, { useRef } from "react";
import DottedBackground from "ui/images/dotted-bg.svg";

import { rootFlowPath } from "../../routes/utils";
import Flow from "./components/Flow";
import Sidebar from "./components/Sidebar";
import { useStore } from "./lib/store";
import useScrollControlsAndRememberPosition from "./lib/useScrollControlsAndRememberPosition";

const EditorContainer = styled(Box)(() => ({
  display: "flex",
  alignItems: "stretch",
  overflow: "hidden",
  flexGrow: 1,
  position: "relative",
}));

const EditorBackground = styled(Box)(() => ({
  position: "absolute",
  width: "100%",
  height: "100%",
  top: 0,
  left: 0,
  backgroundImage: `url('${DottedBackground}')`,
  backgroundRepeat: "repeat",
  backgroundSize: "16px",
  zIndex: -1,
}));

const FlowEditor: React.FC<any> = ({ flow, breadcrumbs }) => {
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
          position: "relative",
        }}
      >
        <Box id="editor" ref={scrollContainerRef} sx={{ position: "relative" }}>
          <Box sx={{ position: "relative", width: "auto", height: "auto" }}>
            <EditorBackground />
            <Flow id="flow" flow={flow} breadcrumbs={breadcrumbs} />
          </Box>
        </Box>
      </Box>
      {showSidebar && (
        <Sidebar
          url={`${window.location.origin}${rootFlowPath(false)}/published`}
        />
      )}
    </EditorContainer>
  );
};

export default FlowEditor;

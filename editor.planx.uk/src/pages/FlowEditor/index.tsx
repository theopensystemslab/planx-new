import "./components/Settings";
import "./floweditor.scss";

import Box from "@mui/material/Box";
import React, { useRef } from "react";

import { rootFlowPath } from "../../routes/utils";
import Flow from "./components/Flow";
import PreviewBrowser from "./components/PreviewBrowser";
import { useStore } from "./lib/store";
import useScrollControlsAndRememberPosition from "./lib/useScrollControlsAndRememberPosition";

const FlowEditor: React.FC<any> = ({ flow, breadcrumbs }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useScrollControlsAndRememberPosition(scrollContainerRef);

  const showPreview = useStore((state) => state.showPreview);

  return (
    <Box id="editor-container">
      <Box id="editor" ref={scrollContainerRef} sx={{ position: "relative" }}>
        <Flow flow={flow} breadcrumbs={breadcrumbs} />
      </Box>
      {showPreview && (
        <PreviewBrowser
          url={`${window.location.origin}${rootFlowPath(false)}/preview`}
        />
      )}
    </Box>
  );
};

export default FlowEditor;

import React, { useRef } from "react";
import Flow from "./components/Flow";
import "./floweditor.scss";
import useScrollControlsAndRememberPosition from "./lib/useScrollControlsAndRememberPosition";

const FlowEditor: React.FC<any> = ({ flow, breadcrumbs }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useScrollControlsAndRememberPosition(scrollContainerRef);

  return (
    <div id="editor-container">
      <div id="editor" ref={scrollContainerRef}>
        <Flow flow={flow} breadcrumbs={breadcrumbs} />
      </div>
    </div>
  );
};

export default FlowEditor;

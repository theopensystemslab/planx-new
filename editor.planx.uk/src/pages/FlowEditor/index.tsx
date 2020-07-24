import React, { useRef } from "react";
import Flow from "./components/Flow";
import "./floweditor.scss";
import { useScrollControlsAndRememberPosition } from "./lib/hooks";

const FlowEditor: React.FC<{ id: number }> = ({ id }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useScrollControlsAndRememberPosition(scrollContainerRef);

  return (
    <div id="editor-container">
      <div id="editor" ref={scrollContainerRef}>
        <Flow />
      </div>
    </div>
  );
};

export default FlowEditor;

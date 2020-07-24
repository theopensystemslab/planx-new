import React, { createContext, useRef } from "react";
import Flow from "./components/Flow";
import "./floweditor.scss";
import useFlow from "./lib/useFlow";
import useScrollControlsAndRememberPosition from "./lib/useScrollControlsAndRememberPosition";

export const FlowContext = createContext(null);

const FlowEditor: React.FC<{ id: number }> = ({ id }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useScrollControlsAndRememberPosition(scrollContainerRef);

  const flow = useFlow({ id });

  if (flow.state === null) return <p>Loading...</p>;

  return (
    <div id="editor-container">
      <FlowContext.Provider value={flow}>
        <div id="editor" ref={scrollContainerRef}>
          <Flow />
        </div>
      </FlowContext.Provider>
    </div>
  );
};

export default FlowEditor;

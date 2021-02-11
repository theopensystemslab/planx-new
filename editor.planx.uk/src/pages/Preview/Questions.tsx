import React, { useContext } from "react";

import { componentOutput, useStore } from "../FlowEditor/lib/store";
import { PreviewContext } from "./Context";
import Node from "./Node";

const Questions = () => {
  const [currentCard, previousCard, record] = useStore((state) => [
    state.currentCard,
    state.previousCard(),
    state.record,
  ]);
  const node = currentCard();
  const flow = useContext(PreviewContext);

  return (
    <>
      <span
        onClick={() => record(previousCard)}
        style={{
          padding: "0 10px 10px",
          visibility: previousCard ? "visible" : "hidden",
          pointerEvents: previousCard ? "auto" : "none",
          display: "block",
          cursor: "pointer",
          userSelect: "none",
          alignSelf: "start",
        }}
      >
        ⭠ Back
      </span>

      {node && (
        <Node
          node={node}
          key={node.id}
          handleSubmit={(values: componentOutput) => {
            record(node.id, values);
          }}
          settings={flow?.settings}
        />
      )}
    </>
  );
};

export default Questions;

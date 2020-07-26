import React from "react";
import { api, useStore } from "../../lib/store";
import EndPoint from "./components/EndPoint";
import Hanger from "./components/Hanger";

export enum FlowLayout {
  TOP_DOWN = "top-down",
  LEFT_RIGHT = "left-right",
}

const Node = ({ id }) => {
  const node = useStore((state) => state.flow.nodes[id]);
  return (
    <li onClick={() => api.getState().removeNode(id)}>
      {JSON.stringify(node)}
    </li>
  );
};

const Flow = () => {
  const childNodes = useStore((state) => state.childNodesOf(null));

  return (
    <>
      <ol id="flow" data-layout={FlowLayout.TOP_DOWN}>
        {childNodes.map((node) => (
          <Node key={node.id} {...node} />
        ))}

        <EndPoint text="start" />
        <Hanger />
        <EndPoint text="end" />
      </ol>
    </>
  );
};

export default Flow;

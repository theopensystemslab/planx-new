import React from "react";
import { useStore } from "../../lib/store";
import EndPoint from "./components/EndPoint";
import Hanger from "./components/Hanger";
import Node from "./components/Node";

export enum FlowLayout {
  TOP_DOWN = "top-down",
  LEFT_RIGHT = "left-right",
}

const Flow = ({ flow, breadcrumbs = [] }) => {
  const [childNodes, getNode] = useStore((state) => [
    state.childNodesOf(breadcrumbs[breadcrumbs.length - 1] || null),
    state.getNode,
  ]);

  breadcrumbs = breadcrumbs.map((id) => ({
    id,
    ...getNode(id),
    href: `${window.location.pathname.split(id)[0]}${id}`,
  }));

  return (
    <>
      <ol id="flow" data-layout={FlowLayout.TOP_DOWN}>
        <EndPoint text="start" />

        {breadcrumbs.map((bc) => (
          <Node key={bc.id} {...bc} />
        ))}

        {childNodes.map((node) => (
          <Node key={node.id} {...node} />
        ))}

        <Hanger />
        <EndPoint text="end" />
      </ol>
    </>
  );
};

export default Flow;

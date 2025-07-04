import { ROOT_NODE_KEY } from "@planx/graph";
import React from "react";
import { rootFlowPath } from "routes/utils";

import { useStore } from "../../lib/store";
import EndPoint from "./components/EndPoint";
import Hanger from "./components/Hanger";
import Node from "./components/Node";
import { GetStarted } from "./GetStarted";

export enum FlowLayout {
  TOP_DOWN = "top-down",
  LEFT_RIGHT = "left-right",
}

const Flow = ({
  breadcrumbs = [],
  lockedFlow,
  showTemplatedNodeStatus,
}: any) => {
  const [childNodes, getNode, flowLayout] = useStore((state) => [
    state.childNodesOf(breadcrumbs[breadcrumbs.length - 1] || ROOT_NODE_KEY),
    state.getNode,
    state.flowLayout,
  ]);

  breadcrumbs = breadcrumbs.map((id: any) => ({
    id,
    ...getNode(id),
    href: `${window.location.pathname.split(id)[0]}${id}`,
  }));

  const [_rootPath, ...portals] = rootFlowPath(true).split(",");
  const isFlowRoot = !portals.length;
  const showGetStarted = isFlowRoot && !childNodes.length;

  return (
    <>
      <ol id="flow" data-layout={flowLayout} className="decisions">
        <EndPoint text="start" />
        {showGetStarted && <GetStarted />}

        {breadcrumbs.map((bc: any) => (
          <Node
            key={bc.id}
            {...bc}
            lockedFlow={lockedFlow}
            showTemplatedNodeStatus={showTemplatedNodeStatus}
          />
        ))}

        {childNodes.map((node) => (
          <Node
            key={node.id}
            {...node}
            lockedFlow={lockedFlow}
            showTemplatedNodeStatus={showTemplatedNodeStatus}
          />
        ))}

        <Hanger />
        <EndPoint text="end" />
      </ol>
    </>
  );
};

export default Flow;

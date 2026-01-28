import Box from "@mui/material/Box";
import { ROOT_NODE_KEY } from "@planx/graph";
import { Link, useParams } from "@tanstack/react-router";
import React from "react";
import { rootFlowPath } from "utils/routeUtils/utils";

import { useStore } from "../../lib/store";
import { ContextMenu } from "./components/ContextMenu";
import EndPoint from "./components/EndPoint";
import Hanger from "./components/Hanger";
import Node from "./components/Node";
import { GetStarted } from "./GetStarted";

export enum FlowLayout {
  TOP_DOWN = "top-down",
  LEFT_RIGHT = "left-right",
}

interface Props {
  lockedFlow: boolean;
  showTemplatedNodeStatus: boolean;
}

const Flow: React.FC<Props> = ({ lockedFlow, showTemplatedNodeStatus }) => {
  const { flow } = useParams({ from: "/_authenticated/$team/$flow" });
  const [_flow, ...breadcrumbIds] = flow.split(",");

  const [childNodes, getNode, flowLayout] = useStore((state) => [
    state.childNodesOf(
      breadcrumbIds[breadcrumbIds.length - 1] || ROOT_NODE_KEY,
    ),
    state.getNode,
    state.flowLayout,
  ]);

  const breadcrumbs = breadcrumbIds.map((id) => ({
    id,
    ...getNode(id),
    href: `${window.location.pathname.split(id)[0]}${id}`,
  }));

  const [_rootPath, ...portals] = rootFlowPath(true).split(",");
  const isFlowRoot = !portals.length;
  const showGetStarted = isFlowRoot && !childNodes.length;

  const flowName = useStore((state) => state.flowName);

  return (
    <>
      <ol
        id="flow"
        data-layout={flowLayout}
        className={`decisions${breadcrumbs.length ? " nested-decisions" : ""}`}
      >
        <EndPoint text="start" />

        {breadcrumbs.length ? (
          <li className="root-node-link">
            <Link to={rootFlowPath(false)} preload={false}>
              {flowName}
            </Link>
          </li>
        ) : null}

        {showGetStarted && <GetStarted />}

        {breadcrumbs.map((bc, index) => {
          let className = "";

          if (index === 0) {
            className += "breadcrumb--first";
          }

          if (index === breadcrumbs.length - 1) {
            className += className
              ? " breadcrumb--active"
              : "breadcrumb--active";
          }

          return (
            <Node
              key={bc.id}
              {...bc}
              lockedFlow={lockedFlow}
              showTemplatedNodeStatus={showTemplatedNodeStatus}
              className={className}
            />
          );
        })}

        <Box className="flow-child-nodes">
          {childNodes.map((node) => (
            <Node
              key={node.id}
              {...node}
              lockedFlow={lockedFlow}
              showTemplatedNodeStatus={showTemplatedNodeStatus}
            />
          ))}
          <Hanger />
        </Box>
        {breadcrumbs.length ? (
          <li className="root-node-link root-node-link--end">
            <Link to={rootFlowPath(false)} preload={false}>
              {flowName}
            </Link>
          </li>
        ) : null}
        <EndPoint text="end" />
      </ol>
      <ContextMenu />
    </>
  );
};

export default Flow;

import Box from "@mui/material/Box";
import { NodeId } from "@opensystemslab/planx-core/types";
import { ROOT_NODE_KEY } from "@planx/graph";
import React, { useState } from "react";
import { Link } from "react-navi";
import { rootFlowPath } from "routes/utils";

import { useStore } from "../../lib/store";
import { ContextMenu, ContextMenuA11yProps, ContextMenuPosition } from "./components/ContextMenu";
import EndPoint from "./components/EndPoint";
import Hanger from "./components/Hanger";
import Node from "./components/Node";
import { GetStarted } from "./GetStarted";

export enum FlowLayout {
  TOP_DOWN = "top-down",
  LEFT_RIGHT = "left-right",
}

export interface Relationships {
  nodeId?: NodeId;
  parent: NodeId;
  before?: NodeId;
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

  const [relationships, setRelationships] = useState<Relationships>({ nodeId: undefined, parent: ROOT_NODE_KEY, before: undefined })

  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null);

  const handleContext = (event: React.MouseEvent, relationships: Relationships) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
          mouseX: event.clientX + 2,
          mouseY: event.clientY - 6,
        }
        : null,
    );
    setRelationships(relationships)
  };

  const isContextMenuOpen = contextMenu !== null;

  const handleClose = () => {
    setContextMenu(null);
  };

  const contextMenuA11yProps: ContextMenuA11yProps = {
    "aria-controls": isContextMenuOpen ? "basic-menu" : undefined,
    "aria-haspopup": "true",
    "aria-expanded": isContextMenuOpen ? "true" : undefined,
}

  breadcrumbs = breadcrumbs.map((id: any) => ({
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
            <Link href={rootFlowPath(false)} prefetch={false}>
              {flowName}
            </Link>
          </li>
        ) : null}

        {showGetStarted && <GetStarted />}

        {breadcrumbs.map((bc: any, index: number) => {
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
              handleContext={handleContext}
              contextMenuA11yProps={contextMenuA11yProps}
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
              handleContext={handleContext}
              contextMenuA11yProps={contextMenuA11yProps}
            />
          ))}

          <Hanger 
            handleContext={handleContext}
            contextMenuA11yProps={contextMenuA11yProps}
          />
        </Box>
        {breadcrumbs.length ? (
          <li className="root-node-link root-node-link--end">
            <Link href={rootFlowPath(false)} prefetch={false}>
              {flowName}
            </Link>
          </li>
        ) : null}
        <EndPoint text="end" />
      </ol>
      <ContextMenu
        relationships={relationships}
        open={isContextMenuOpen}
        handleClose={handleClose}
        contextMenu={contextMenu}
      />
    </>
  );
};

export default Flow;

import Box from "@mui/material/Box";
import { ROOT_NODE_KEY } from "@planx/graph";
import { Link, useParams, useRouteContext } from "@tanstack/react-router";
import { useFlowNodeNotes } from "hooks/data/useFlowNodeNotes";
import React from "react";

import { useStore } from "../../lib/store";
import { ContextMenu } from "./components/ContextMenu";
import EndPoint from "./components/EndPoint";
import Hanger from "./components/Hanger";
import Node from "./components/Node";
import StickyNoteCard from "./components/StickyNoteCard";
import { GetStarted } from "./GetStarted";
import { FlowNotesContext } from "./lib/flowNotesContext";

export enum FlowLayout {
  TOP_DOWN = "top-down",
  LEFT_RIGHT = "left-right",
}

interface Props {
  lockedFlow: boolean;
  showTemplatedNodeStatus: boolean;
}

const Flow: React.FC<Props> = ({ lockedFlow, showTemplatedNodeStatus }) => {
  const { rootFlow, folderIds } = useRouteContext({
    from: "/_authenticated/app/$team/$flow",
  });
  const { flow, team } = useParams({ from: "/_authenticated/app/$team/$flow" });

  const [rawChildNodes, getNode, flowLayout, flowId] = useStore((state) => [
    state.childNodesOf(folderIds[folderIds.length - 1] || ROOT_NODE_KEY),
    state.getNode,
    state.flowLayout,
    state.id,
  ]);

  const currentParentId = folderIds[folderIds.length - 1] || ROOT_NODE_KEY;
  const { notesForNode } = useFlowNodeNotes(flowId);

  const breadcrumbs = folderIds.map((id) => ({
    id,
    ...getNode(id),
    href: `/app/$team/${flow.split(id)[0]}${id}`,
  }));

  const isFlowRoot = flow === rootFlow;
  const showGetStarted = isFlowRoot && !rawChildNodes.length;

  const flowName = useStore((state) => state.flowName);

  return (
    <FlowNotesContext.Provider value={{ notesForNode }}>
      <ol
        id="flow"
        data-layout={flowLayout}
        className={`decisions${breadcrumbs.length ? " nested-decisions" : ""}`}
      >
        <EndPoint text="start" />

        {breadcrumbs.length ? (
          <li className="root-node-link">
            <Link
              to={"/app/$team/$flow"}
              params={{ team, flow: rootFlow }}
              preload={false}
            >
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
          {rawChildNodes.flatMap((node) => {
            const beforeNotes = notesForNode(node.id!).filter(
              (n) => n.placement === "before_node",
            );
            const noteParentId =
              currentParentId === ROOT_NODE_KEY ? undefined : currentParentId;

            return [
              ...beforeNotes.flatMap((note) => [
                <Hanger
                  key={`hanger-${note.id}`}
                  before={node.id!}
                  parent={noteParentId}
                />,
                <StickyNoteCard
                  key={`note-${note.id}`}
                  note={note}
                  parentId={noteParentId}
                />,
              ]),
              <Node
                key={node.id}
                {...node}
                noteParentId={noteParentId}
                lockedFlow={lockedFlow}
                showTemplatedNodeStatus={showTemplatedNodeStatus}
              />,
            ];
          })}
          <Hanger />
        </Box>
        {breadcrumbs.length ? (
          <li className="root-node-link root-node-link--end">
            <Link
              to="/app/$team/$flow"
              params={{ team, flow: rootFlow }}
              preload={false}
            >
              {flowName}
            </Link>
          </li>
        ) : null}
        <EndPoint text="end" />
      </ol>
      <ContextMenu />
    </FlowNotesContext.Provider>
  );
};

export default Flow;

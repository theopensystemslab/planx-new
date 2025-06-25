import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import classnames from "classnames";
import React from "react";
import { useDrop } from "react-dnd";
import { Link } from "react-navi";

import { rootFlowPath } from "../../../../../routes/utils";
import { useStore } from "../../../lib/store";
import { getParentId } from "../lib/utils";

interface HangerProps {
  hidden?: boolean;
  parent?: any;
  before?: any;
}

interface Item {
  id: string;
  parent: string;
  text: string;
}

const buildHref = (before: any, parent: any) => {
  let hrefParts = [rootFlowPath(true)];
  if (parent) {
    hrefParts = hrefParts.concat(["nodes", parent]);
  }
  return hrefParts.concat(["nodes", "new", before]).filter(Boolean).join("/");
};

const Hanger: React.FC<HangerProps> = ({ before, parent, hidden = false }) => {
  parent = getParentId(parent);

  const [moveNode, pasteNode, isTemplatedFrom, flow, orderedFlow] = useStore(
    (state) => [
      state.moveNode,
      state.pasteNode,
      state.isTemplatedFrom,
      state.flow,
      state.orderedFlow,
    ],
  );

  // useStore.getState().getTeam().slug undefined here, use window instead
  const teamSlug = window.location.pathname.split("/")[1];

  // When working in a templated flow, if any internal portal is marked as "isTemplatedNode", then the Hanger should be visible to add children
  const indexedParent = orderedFlow?.find(({ id }) => id === parent);
  const parentIsTemplatedInternalPortal =
    indexedParent?.type === TYPES.InternalPortal &&
    Boolean(flow[indexedParent.id]?.data?.isTemplatedNode);
  const parentIsWithinTemplatedInternalPortal =
    indexedParent?.type === TYPES.InternalPortal &&
    indexedParent?.parentId &&
    Boolean(flow[indexedParent.parentId]?.data?.isTemplatedNode);

  const showHangerInTemplatedNodes =
    parentIsTemplatedInternalPortal || parentIsWithinTemplatedInternalPortal;

  // Hiding the hanger is a proxy for disabling a 'view-only' user from adding, moving, cloning nodes
  const hideHangerFromUser =
    !useStore.getState().canUserEditTeam(teamSlug) ||
    (isTemplatedFrom && !showHangerInTemplatedNodes);

  const [{ canDrop, item }, drop] = useDrop({
    accept: ["DECISION", "PORTAL", "PAGE"],
    drop: (item: Item) => {
      moveNode(item.id, item.parent, before, parent);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
      item: monitor.isOver() && monitor.getItem(),
    }),
  });

  const handleContext = (e: React.MouseEvent) => {
    e.preventDefault();
    pasteNode(parent || undefined, before || undefined);
  };

  return (
    <li
      className={classnames("hanger", { hidden: hidden || hideHangerFromUser })}
      ref={drop}
    >
      <Link
        href={buildHref(before, parent)}
        prefetch={false}
        onContextMenu={handleContext}
      >
        {canDrop && item && item.text}
      </Link>
    </li>
  );
};

export default Hanger;

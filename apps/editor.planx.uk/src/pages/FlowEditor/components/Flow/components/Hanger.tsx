import { NodeId } from "@opensystemslab/planx-core/types";
import classnames from "classnames";
import { useContextMenu } from "hooks/useContextMenu";
import isEmpty from "lodash/isEmpty";
import {
  nodeIsChildOfTemplatedInternalPortal,
  nodeIsTemplatedInternalPortal,
} from "pages/FlowEditor/utils";
import React, { useEffect } from "react";
import { useDrop } from "react-dnd";
import { Link } from "react-navi";

import { rootFlowPath } from "../../../../../routes/utils";
import { useStore } from "../../../lib/store";
import { getParentId } from "../lib/utils";

interface HangerProps {
  hidden?: boolean;
  parent?: NodeId;
  before?: NodeId;
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

  const [
    moveNode,
    isTemplatedFrom,
    flow,
    orderedFlow,
    setOrderedFlow,
  ] = useStore((state) => [
    state.moveNode,
    state.isTemplatedFrom,
    state.flow,
    state.orderedFlow,
    state.setOrderedFlow,
  ]);

  useEffect(() => {
    // Flow might not be loaded via ShareDB (e.g. user has navigated directly to :flow/somePage)
    if (isEmpty(flow)) return;

    if (!orderedFlow) setOrderedFlow();
  }, [orderedFlow, setOrderedFlow, flow]);

  // useStore.getState().getTeam().slug undefined here, use window instead
  const teamSlug = window.location.pathname.split("/")[1];

  // When working in a templated flow, if any internal portal is marked as "isTemplatedNode", then the Hanger should be visible to add children
  const indexedParent = orderedFlow?.find(({ id }) => id === parent);
  const parentIsTemplatedInternalPortal = nodeIsTemplatedInternalPortal(
    flow,
    indexedParent,
  );
  const parentIsChildOfTemplatedInternalPortal =
    nodeIsChildOfTemplatedInternalPortal(flow, indexedParent);

  const hideHangerInTemplatedFlow = !(
    parentIsTemplatedInternalPortal || parentIsChildOfTemplatedInternalPortal
  );

  // Hiding the hanger is a proxy for disabling a 'view-only' user from adding, moving, cloning nodes
  const hideHangerFromUser = isTemplatedFrom
    ? hideHangerInTemplatedFlow
    : !useStore.getState().canUserEditTeam(teamSlug);

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

  const handleContextMenu = useContextMenu({
    source: "hanger",
    relationships: { parent, before }
  });

  return (
    <li
      className={classnames("hanger", { hidden: hidden || hideHangerFromUser })}
      ref={drop}
    >
      <Link
        href={buildHref(before, parent)}
        prefetch={false}
        onContextMenu={handleContextMenu}
      >
        {canDrop && item && item.text}
      </Link>
    </li>
  );
};

export default Hanger;

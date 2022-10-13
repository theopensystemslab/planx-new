import { TYPES } from "@planx/components/types";
import classNames from "classnames";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { useDrag } from "react-dnd";
import { Link } from "react-navi";

import { getParentId } from "../lib/utils";
import Hanger from "./Hanger";
import Node from "./Node";

type Props = {
  type: TYPES;
};

const Page: React.FC<Props> = (props: any) => {
  const [isClone, childNodes, copyNode, flow] = useStore((state) => [
    state.isClone,
    state.childNodesOf(props.id),
    state.copyNode,
    state.flow,
  ]);

  const parent = getParentId(props.parent);

  const allowedNodeTypes = [];
  console.log("dragging node", props.id, flow[props.id]?.type);

  const [{ isDragging }, drag] = useDrag({
    item: {
      id: props.id,
      parent,
      text: props.text,
    },
    type: "PAGE",
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  let href = `${window.location.pathname}/nodes/${props.id}/edit`;
  if (parent) {
    href = `${window.location.pathname}/nodes/${parent}/nodes/${props.id}/edit`;
  }

  const handleContext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    copyNode(props.id);
  };

  return (
    <>
      <Hanger hidden={isDragging} before={props.id} parent={parent} />
      <li
        className={classNames("card", "page", {
          isDragging,
          isClone: isClone(props.id),
        })}
      >
        <Link
          href={href}
          prefetch={false}
          onContextMenu={handleContext}
          ref={drag}
        >
          <span>{props.text}</span>
        </Link>
        <ol>
          {childNodes.map((child: any) => (
            <Node key={child.id} parent={props.id} {...child} />
          ))}
          <Hanger parent={props.id} />
        </ol>
      </li>
    </>
  );
};

export default Page;

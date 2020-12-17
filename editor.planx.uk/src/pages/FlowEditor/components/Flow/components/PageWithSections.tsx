import classNames from "classnames";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { useDrag } from "react-dnd";
import { Link } from "react-navi";

import { getParentId } from "../lib/utils";
import Hanger from "./Hanger";
import Node from "./Node";

const Component: React.FC = (props: any) => {
  const parent = getParentId(props.parent);

  const [isClone, childNodes, copyNode] = useStore((state) => [
    state.isClone,
    state.childNodesOf(props.id),
    state.copyNode,
  ]);

  const [{ isDragging }, drag] = useDrag({
    item: {
      id: props.id,
      parent,
      text: props.text,
      type: "PAGE",
    },
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
        className={classNames("card", "page", "sections", {
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
        <ol className="options">
          {childNodes.map((child: any) => (
            // <li key={child.id}>
            //   <ol>
            <Node key={child.id} parent={props.id} {...child} />
            //     <Hanger />
            //   </ol>
            // </li>
          ))}
          <Hanger hidden={isDragging} parent={props.id} />
        </ol>
        <div className="spacer" />
      </li>
    </>
  );
};

export default Component;

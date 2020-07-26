import classNames from "classnames";
import React from "react";
import { useDrag } from "react-dnd";
import { Link } from "react-navi";
import { useStore } from "../../../lib/store";
import { getParentId } from "../../../lib/utils";
import Hanger from "./Hanger";
import Node from "./Node";

const Question: React.FC<any> = (props) => {
  const parent = getParentId(props.parent);

  const [{ isDragging }, drag] = useDrag({
    item: {
      id: props.id,
      parent,
      text: props.text,
      type: "DECISION",
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // const [isClone, childNodesOf, copyNode] = useStore((state) => [
  //   state.isClone,
  //   state.childNodesOf,
  //   state.copyNode,
  // ]);

  const [childNodesOf] = useStore((state) => [state.childNodesOf]);

  let href = `${window.location.pathname}/nodes/${props.id}/edit`;
  if (parent) {
    href = `${window.location.pathname}/nodes/${parent}/nodes/${props.id}/edit`;
  }

  const handleContext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // copyNode(props.id);
  };

  return (
    <>
      <Hanger hidden={isDragging} before={props.id} parent={parent} />
      <li
        className={classNames("card", "decision", {
          isDragging,
          // isClone: isClone(props.id),
        })}
      >
        <Link href={href} prefetch={false} onContextMenu={handleContext}>
          <span ref={drag}>{props.text}</span>
        </Link>
        <ol>
          {childNodesOf(props.id).map((child: any) => (
            <Node key={child.id} {...child} />
          ))}
        </ol>
      </li>
    </>
  );
};

export default Question;

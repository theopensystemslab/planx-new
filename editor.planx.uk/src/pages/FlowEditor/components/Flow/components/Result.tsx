import classNames from "classnames";
import React from "react";
import { useDrag } from "react-dnd";
import { Link } from "react-navi";
import flags from "../../../data/flags";
import { useStore } from "../../../lib/store";
import { getParentId } from "../../../lib/utils";
import Hanger from "./Hanger";

const Result: React.FC<any> = React.memo((props) => {
  const [isClone, childNodes] = useStore((state) => [
    state.isClone,
    state.childNodesOf(props.id),
  ]);

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

  let href = `${window.location.pathname}/nodes/${props.id}/edit`;
  if (parent) {
    href = `${window.location.pathname}/nodes/${parent}/nodes/${props.id}/edit`;
  }

  return (
    <>
      <Hanger hidden={isDragging} before={props.id} parent={parent} />
      <li
        className={classNames("card", "decision", {
          isDragging,
          isClone: isClone(props.id),
          isNote: childNodes.length === 0,
        })}
      >
        <Link href={href} prefetch={false} ref={drag}>
          <span>{props.text}</span>
        </Link>
        <ol>
          {flags
            .filter((f) => f.category === "Planning permission")
            .map((flag: any) => (
              <li className="card option" key={flag.value}>
                <Link
                  href={href}
                  prefetch={false}
                  onClick={(e) => e.preventDefault()}
                  style={{
                    background: flag.bgColor,
                    color: flag.color.toHexString(),
                  }}
                >
                  <span>{flag.text}</span>
                </Link>
                <ol style={{ pointerEvents: "none", opacity: 0.5 }}>
                  <Hanger parent={props.id} />
                </ol>
                {/* <ol>
                {childNodes.map((child: any) => (
                  <Node key={child.id} parent={props.id} {...child} />
                ))}
                <Hanger parent={props.id} />
              </ol> */}
              </li>
            ))}
        </ol>
      </li>
    </>
  );
});

export default Result;

import { flatFlags } from "@opensystemslab/planx-core/types";
import classNames from "classnames";
import React from "react";
import { Link } from "react-navi";

import { useStore } from "../../../lib/store";
import Hanger from "./Hanger";
import Node from "./Node";

const Option: React.FC<any> = (props) => {
  const childNodes = useStore((state) => state.childNodesOf(props.id));

  const href = "";

  let background = "#F9F8F8"; // no flag color
  let color = "#000";
  try {
    const flag = flatFlags.find(({ value }) =>
      [props.data?.flag, props.data?.val].filter(Boolean).includes(value),
    );
    background = flag?.bgColor || background;
    color = flag?.color || color;
  } catch (e) {}

  return (
    <li
      className={classNames("card", "option", { wasVisited: props.wasVisited })}
    >
      <Link href={href} prefetch={false} onClick={(e) => e.preventDefault()}>
        <div className="band" style={{ background, color }}></div>
        <div className="text">{props.data.text}</div>
      </Link>
      <ol className="decisions">
        {childNodes.map((child: any) => (
          <Node key={child.id} parent={props.id} {...child} />
        ))}
        <Hanger parent={props.id} />
      </ol>
    </li>
  );
};

export default Option;

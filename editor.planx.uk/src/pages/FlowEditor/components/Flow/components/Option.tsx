import React from "react";
import { Link } from "react-navi";
import flags from "../../../data/flags";
import { useStore } from "../../../lib/store";
import Hanger from "./Hanger";
import Node from "./Node";

const Option: React.FC<any> = (props) => {
  const childNodes = useStore((state) => state.childNodesOf(props.id));

  const href = "";

  let background = "#AEAEAE"; // no flag color
  let color = "#000";
  try {
    const flag = flags.find(({ value }) => value === props.flag);
    background = flag.bgColor;
    color = flag.color;
  } catch (e) {}

  return (
    <li className="card option">
      <Link
        href={href}
        prefetch={false}
        onClick={(e) => e.preventDefault()}
        style={{ background, color }}
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
  );
};

export default Option;

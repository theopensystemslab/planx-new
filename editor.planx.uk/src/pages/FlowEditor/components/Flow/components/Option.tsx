import React from "react";
import { Link } from "react-navi";
import { useStore } from "../../../lib/store";
import Hanger from "./Hanger";
import Node from "./Node";

const Option: React.FC<any> = (props) => {
  const childNodes = useStore((state) => state.childNodesOf(props.id));

  const href = "";

  return (
    <li className="card option">
      <Link href={href} prefetch={false} onClick={(e) => e.preventDefault()}>
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

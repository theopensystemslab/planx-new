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

  let background = "#AEAEAE"; // no flag color
  let color = "#000";
  try {
    const flag = flatFlags.find(({ value }) =>
      [props.data?.flag, props.data?.val].filter(Boolean).includes(value),
    );
    background = flag?.bgColor || background;
    color = flag?.color || color;
  } catch (e) {}

  // useStore.getState().getTeam().slug undefined here, use window instead
  const teamSlug = window.location.pathname.split("/")[1];

  return (
    <li
      className={classNames("card", "option", { wasVisited: props.wasVisited })}
    >
      <Link
        href={href}
        prefetch={false}
        onClick={(e) => e.preventDefault()}
        style={{ background, color }}
      >
        <span>{props.data.text}</span>
      </Link>
      <ol className="decisions">
        {childNodes.map((child: any) => (
          <Node key={child.id} parent={props.id} {...child} />
        ))}
        <Hanger
          parent={props.id}
          hidden={!useStore.getState().canUserEditTeam(teamSlug)}
        />
      </ol>
    </li>
  );
};

export default Option;

import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { flatFlags } from "@opensystemslab/planx-core/types";
import classNames from "classnames";
import React from "react";
import { Link } from "react-navi";

import { useStore } from "../../../lib/store";
import Hanger from "./Hanger";
import Node from "./Node";

const Flag = styled(Box)(() => ({
  fontWeight: "700",
  padding: "6px",
  height: "100%",
  display: "flex",
  alignItems: "center",
  fontSize: "0.9em",
  borderLeft: "1px solid #b1b4b6",
  "&::after": {
    content: '"N/A"',
  },
  "&.planning-permission::after": {
    content: '"PLA"',
  },
  "&.works-to-trees--hedges::after": {
    content: '"WTH"',
  },
  "&.community-infrastructure-levy::after": {
    content: '"CIL"',
  },
  "&.listed-building-consent::after": {
    content: '"LBC"',
  },
  "&.demolition-in-a-conservation-area::after": {
    content: '"DCA"',
  },
  "&.planning-policy::after": {
    content: '"POL"',
  },
}));

const Option: React.FC<any> = (props) => {
  const childNodes = useStore((state) => state.childNodesOf(props.id));

  const href = "";

  let background = "#F9F8F8"; // no flag color
  let color = "#000";
  let category = "NA";
  try {
    const flag = flatFlags.find(({ value }) =>
      [props.data?.flag, props.data?.val].filter(Boolean).includes(value),
    );
    background = flag?.bgColor || background;
    color = flag?.color || color;
    category = flag?.category.toLowerCase().replaceAll(" ", "-").replaceAll("&", "") || category;

  } catch (e) {}

  return (
    <li
      className={classNames("card", "option", { wasVisited: props.wasVisited })}
    >
      <Link href={href} prefetch={false} onClick={(e) => e.preventDefault()}>
        <div className="text">{props.data.text}</div>
        <Flag className={category} style={{ background, color }}></Flag>
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

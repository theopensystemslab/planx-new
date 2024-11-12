import { Flag, flatFlags } from "@opensystemslab/planx-core/types";
import classNames from "classnames";
import React from "react";
import { Link } from "react-navi";

import { useStore } from "../../../lib/store";
import { DataField } from "./DataField";
import { FlagBand, NoFlagBand } from "./FlagBand";
import Hanger from "./Hanger";
import Node from "./Node";
import { Thumbnail } from "./Thumbnail";

const Option: React.FC<any> = (props) => {
  const childNodes = useStore((state) => state.childNodesOf(props.id));

  const href = "";
  let flags: Flag[] | undefined;

  try {
    // Question & Checklist Options set zero or many flag values under "data.flag"
    if (props.data?.flag) {
      if (Array.isArray(props.data?.flag)) {
        flags = flatFlags.filter(
          ({ value }) => props.data?.flag?.includes(value),
        );
      } else {
        flags = flatFlags.filter(({ value }) => props.data?.flag === value);
      }
    }

    // Filter Options set single flag value under "data.val" (Questions & Checklists use this same field for passport values)
    if (props.data?.val) {
      const flagValues = flatFlags.map((flag) => flag.value).filter(Boolean);
      if (flagValues.includes(props.data.val)) {
        flags = flatFlags.filter(({ value }) => props.data.val === value);
      }
    }
  } catch (e) {}

  return (
    <li
      className={classNames("card", "option", { wasVisited: props.wasVisited })}
    >
      <Link
        style={{ width: "200px" }}
        href={href}
        prefetch={false}
        onClick={(e) => e.preventDefault()}
      >
        {props.data?.img && (
          <Thumbnail
            imageSource={props.data?.img}
            imageAltText={props.data.text}
          />
        )}
        {flags && flags.length > 0 ? (
          flags.map((flag) => (
            <FlagBand key={`${props.id}-${flag.value}`} flag={flag} />
          ))
        ) : (
          <NoFlagBand />
        )}
        <div className="text">{props.data.text}</div>
        {props.data?.val && (
          <DataField value={props.data.val} variant="child" />
        )}
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

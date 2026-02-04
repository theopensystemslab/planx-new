import { Flag, flatFlags } from "@opensystemslab/planx-core/types";
import { Link } from "@tanstack/react-router";
import classNames from "classnames";
import React from "react";

import { useStore } from "../../../lib/store";
import { DataField } from "./DataField";
import { FlagBand, NoFlagBand } from "./FlagBand";
import Hanger from "./Hanger";
import Node from "./Node";
import { Thumbnail } from "./Thumbnail";

const Option: React.FC<any> = (props) => {
  const { teamSlug, flowSlug } = useStore((state) => ({
    teamSlug: state.teamSlug,
    flowSlug: state.flowSlug,
  }));
  const childNodes = useStore((state) => state.childNodesOf(props.id));

  let flags: Flag[] | undefined;

  try {
    // Question & Checklist Options set zero or many flag values under "data.flags"
    if (props.data?.flags) {
      flags = flatFlags.filter(({ value }) =>
        props.data?.flags?.includes(value),
      );
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
      onContextMenu={(e) => e.preventDefault()}
    >
      <Link
        to="/$team/$flow/nodes/$id/edit"
        params={{
          team: teamSlug,
          flow: flowSlug,
          id: props.parent,
        }}
        hash={props.id}
        preload={false}
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
          <Node
            key={child.id}
            parent={props.id}
            {...child}
            showTemplatedNodeStatus={props.showTemplatedNodeStatus}
          />
        ))}
        <Hanger parent={props.id} />
      </ol>
    </li>
  );
};

export default Option;

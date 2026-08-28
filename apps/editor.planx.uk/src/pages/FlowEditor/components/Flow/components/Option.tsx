import type { Flag } from "@opensystemslab/planx-core/types";
import { flatFlags } from "@opensystemslab/planx-core/types";
import { Link, useParams } from "@tanstack/react-router";
import classNames from "classnames";
import { useContextMenu } from "hooks/useContextMenu";
import React from "react";

import { useStore } from "../../../lib/store";
import { getParentId } from "../lib/utils";
import { DataField } from "./DataField";
import { FlagBand, NoFlagBand } from "./FlagBand";
import Hanger from "./Hanger";
import Node from "./Node";
import { Thumbnail } from "./Thumbnail";

const Option: React.FC<any> = (props) => {
  const { team, flow } = useParams({ from: "/_authenticated/app/$team/$flow" });
  const childNodes = useStore((state) => state.childNodesOf(props.id));

  // The folder containing the Question/Checklist this Option belongs to -
  const containerFolderId = getParentId(props.containerFolderId);

  const parent = getParentId(props.parent);

  const handleContextMenu = useContextMenu({
    source: "node",
    relationships: {
      parent,
      before: props.id,
      self: props.id,
    },
  });

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
    >
      <div className="card-wrapper">
        <Link
          to={
            containerFolderId
              ? "/app/$team/$flow/nodes/$parent/nodes/$id/edit"
              : "/app/$team/$flow/nodes/$id/edit"
          }
          params={{
            team,
            flow,
            id: props.parent,
            ...(containerFolderId && { parent: containerFolderId }),
          }}
          hash={props.id}
          preload={false}
          onContextMenu={handleContextMenu}
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
      </div>
      <ol className="decisions">
        {childNodes.map((child) => (
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

import { Flag, flatFlags } from "@opensystemslab/planx-core/types";
import { Link } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import classNames from "classnames";
import { useContextMenu } from "hooks/useContextMenu";
import React from "react";

import { useStore } from "../../../lib/store";
import { groupNotesWithNodes, isAttachedNoteNode } from "../lib/notesUtils";
import AttachedNotes from "./AttachedNotes";
import { DataField } from "./DataField";
import { FlagBand, NoFlagBand } from "./FlagBand";
import Hanger from "./Hanger";
import Node from "./Node";
import { Thumbnail } from "./Thumbnail";

const Option: React.FC<any> = (props) => {
  const { team, flow } = useParams({ from: "/_authenticated/app/$team/$flow" });
  const [rawChildNodes, storeFlow] = useStore((state) => [
    state.childNodesOf(props.id),
    state.flow,
  ]);

  // Notes attached to an option are stored as leading children of the option node
  const attachedOptionNotes = rawChildNodes.filter((n) =>
    isAttachedNoteNode(n, storeFlow),
  );
  const branchNodes = rawChildNodes.slice(attachedOptionNotes.length);
  const childGroups = groupNotesWithNodes(branchNodes, storeFlow);

  const handleContextMenu = useContextMenu({
    source: "option",
    relationships: {
      self: props.id,
      parent: props.parent,
      before: props.id,
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
      onContextMenu={handleContextMenu}
    >
      <Link
        to="/app/$team/$flow/nodes/$id/edit"
        params={{
          team,
          flow,
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
      <AttachedNotes
        notes={props.associatedNotes || []}
        parentId={props.parent}
      />
      <AttachedNotes notes={attachedOptionNotes} parentId={props.id} />
      <ol className="decisions">
        {childGroups.map(({ node, notes }) => (
          <Node
            key={node.id}
            parent={props.id}
            {...node}
            associatedNotes={notes}
            noteParentId={props.id}
            showTemplatedNodeStatus={props.showTemplatedNodeStatus}
          />
        ))}
        <Hanger parent={props.id} />
      </ol>
    </li>
  );
};

export default Option;

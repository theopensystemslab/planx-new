import { Link, useParams } from "@tanstack/react-router";
import React from "react";

import { Store, useStore } from "../../../lib/store";

interface Props {
  notes: Store.Node[];
  parentId: string;
}

const AttachedNotes: React.FC<Props> = ({ notes, parentId }) => {
  const { team, flow } = useParams({ from: "/_authenticated/app/$team/$flow" });
  const showNotes = useStore((state) => state.showNotes);

  if (!showNotes || !notes.length) return null;

  return (
    <div className="attached-notes">
      {notes.map((note) => (
        <Link
          key={note.id}
          to={
            parentId
              ? "/app/$team/$flow/nodes/$parent/nodes/$id/edit"
              : "/app/$team/$flow/nodes/$id/edit"
          }
          params={{
            team,
            flow,
            id: note.id!,
            ...(parentId && { parent: parentId }),
          }}
          preload={false}
        >
          <div className="attached-note">
            {note.data?.text || "Untitled note"}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default AttachedNotes;

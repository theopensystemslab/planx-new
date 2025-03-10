import Typography from "@mui/material/Typography";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import React from "react";

export interface AlteredNode {
  id: string;
  type: TYPES;
  data?: any;
}

export const AlteredNodeListItem = (props: { node: AlteredNode }) => {
  const { node } = props;
  let text, data;

  if (node.id === "_root") {
    text = "Changed _root service by adding, deleting or re-ordering nodes";
  } else if (node.id === "0") {
    text = `The entire _root service will be published for the first time`;
  } else if (node.id && Object.keys(node).length === 1) {
    text = `Deleted node ${node.id}`;
  } else if (node.type && node.data) {
    text = `Added/edited ${TYPES[node.type]}`;
    data = JSON.stringify(node.data, null, 2);
  } else {
    text = `Added/edited ${TYPES[node.type]}`;
  }

  return (
    <li key={node.id}>
      <Typography variant="body2">{text}</Typography>
      {data && <pre style={{ fontSize: ".8em" }}>{data}</pre>}
    </li>
  );
};

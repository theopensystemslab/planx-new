import { gql, useSubscription } from "@apollo/client";
import Typography from "@mui/material/Typography";
import React from "react";
import { Operation } from "types";

import { useStore } from "../lib/store";
import { formatLastEditMessage } from "../utils";

export const LastEdited = () => {
  const [flowId] = useStore((state) => [state.id]);

  const { data, loading, error } = useSubscription<{ operations: Operation[] }>(
    gql`
      subscription GetMostRecentOperation($flow_id: uuid = "") {
        operations(
          limit: 1
          where: { flow_id: { _eq: $flow_id } }
          order_by: { created_at: desc }
        ) {
          id
          createdAt: created_at
          actor {
            firstName: first_name
            lastName: last_name
          }
        }
      }
    `,
    {
      variables: {
        flow_id: flowId,
      },
    },
  );

  if (error) {
    console.log(error.message);
    return null;
  }

  // Handle missing operations (e.g. non-production data)
  if (data && !data.operations[0].actor) return null;

  let message: string;
  if (loading || !data) {
    message = "Loading...";
  } else {
    const {
      operations: [operation],
    } = data;
    message = formatLastEditMessage(operation?.createdAt, operation?.actor);
  }

  return (
    <Typography variant="body2" fontSize="small">
      {message}
    </Typography>
  );
};

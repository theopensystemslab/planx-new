import { GridRowId } from "@mui/x-data-grid";
import gql from "graphql-tag";
import { getClient } from "lib/graphql";

import { FeedbackStatus } from "../types";

export const updateFeedbackStatus = async (
  selectedRowIds: readonly GridRowId[],
  status: FeedbackStatus,
) => {
  await getClient().mutate<{ updatedFeedback: { id: number }[] }>({
    mutation: gql`
      mutation UpdateFeedbackStatus(
        $status: feedback_status_enum_enum
        $ids: [Int!]
      ) {
        updatedFeedback: update_feedback_many(
          updates: { where: { id: { _in: $ids } }, _set: { status: $status } }
        ) {
          returning {
            id
          }
        }
      }
    `,
    variables: {
      ids: selectedRowIds,
      status,
    },
    update: (cache) => {
      // As we're reading from feedback_summary but pushing an update to feedback, we need to manually invalidate Apollo's cache
      cache.evict({ fieldName: "feedback_summary" });
      cache.gc();
    },
  });
};

import { useQuery } from "@apollo/client";

import { GET_FLOW_EMAIL_ID } from "../queries";
import { GetFlowEmailIdQuery, GetFlowEmailIdQueryVariables } from "../types";

export const useFlowEmailId = (flowId: string) => {
  const query = useQuery<GetFlowEmailIdQuery, GetFlowEmailIdQueryVariables>(
    GET_FLOW_EMAIL_ID,
    {
      variables: { flowId },
    },
  );

  return query;
};

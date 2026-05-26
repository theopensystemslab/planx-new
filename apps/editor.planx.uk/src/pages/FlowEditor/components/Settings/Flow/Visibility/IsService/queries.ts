import { useMutation, useQuery } from "@apollo/client";
import gql from "graphql-tag";

import { GetIsServiceResponse, IsServiceVars } from "./types";

export const GET_IS_SERVICE = gql`
  query GetIsService($flowId: uuid!) {
    flow: flows_by_pk(id: $flowId) {
      isService: is_service
      team {
        settings: team_settings {
          isTrial: is_trial
        }
      }
    }
  }
`;

export const UPDATE_IS_SERVICE = gql`
  mutation SetIsService($flowId: uuid!) {
    update_flows_by_pk(
      pk_columns: { id: $flowId }
      _set: { is_service: true }
    ) {
      id
      isService: is_service
    }
  }
`;

export const useGetIsService = (flowId: string) => {
  return useQuery<GetIsServiceResponse, IsServiceVars>(GET_IS_SERVICE, {
    variables: { flowId },
  });
};

export const useUpdateIsService = (flowId: string) => {
  return useMutation<GetIsServiceResponse, IsServiceVars>(UPDATE_IS_SERVICE, {
    variables: { flowId },
    refetchQueries: [{ query: GET_IS_SERVICE, variables: { flowId } }],
  });
};

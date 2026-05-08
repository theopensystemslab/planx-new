import { useMutation,useQuery } from "@apollo/client";
import gql from "graphql-tag";

import { GetIsServiceResponse, GetIsServiceVars, UpdateIsServiceVars } from "./types"

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
  mutation SetIsService($flowId: uuid!, $isService: Boolean!) {
    update_flows_by_pk(pk_columns: {id: $flowId}, _set: {is_service: $isService, status: offline}) {
      id
      isService: is_service
    }
  }
`;


export const useGetIsService = (flowId: string) => {
  return useQuery<GetIsServiceResponse, GetIsServiceVars>(
    GET_IS_SERVICE,
    {
      variables: { flowId },
    }
  );
};

export const useUpdateIsService = (flowId: string, isService: boolean) => {
  return useMutation<GetIsServiceResponse, UpdateIsServiceVars>(
    UPDATE_IS_SERVICE,
    {
      variables: { flowId, isService },
      refetchQueries: [{ query: GET_IS_SERVICE, variables: { flowId } }],
    }
  );
};


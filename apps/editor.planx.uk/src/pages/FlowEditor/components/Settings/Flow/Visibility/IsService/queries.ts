import { useQuery } from "@apollo/client";
import gql from "graphql-tag";

export const GET_IS_SERVICE = gql`
  query GetIsService($flowId: uuid!) {
    flow: flows_by_pk(id: $flowId) {
      isService: is_service
    }
  }
`;

export const UPDATE_IS_SERVICE = gql`
  mutation SetIsService($flowId: uuid!, $isService: Boolean!) {
    update_flows_by_pk(pk_columns: {id: $flowId}, _set: {is_service: $isService}) {
      isService: is_service
    }
  }
`;

type GetIsServiceVars = { flowId: string};
type GetIsServiceResponse = { isService: boolean };
type UpdateIsServiceVars = {flowId: string, isService: boolean};

export const useGetIsService = (flowId: string) => {
  return useQuery<GetIsServiceResponse, GetIsServiceVars>(
    GET_IS_SERVICE,
    {
      variables: { flowId },
    }
  );
};

export const useUpdateIsService = (flowId: string, isService: boolean) => {
  return useQuery<GetIsServiceResponse, UpdateIsServiceVars>(
    UPDATE_IS_SERVICE,
    {
      variables: { flowId, isService },
    }
  );
};


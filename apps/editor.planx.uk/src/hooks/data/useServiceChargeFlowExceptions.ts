import { gql, useQuery } from "@apollo/client";
import { publicContext } from "lib/graphql/contexts";

const FETCH_SERVICE_CHARGE_FLOW_EXCEPTIONS = gql`
  query FetchServiceChargeFlowExceptions {
    exceptions: service_charge_flow_exceptions {
      flowId: flow_id
    }
  }
`;

export interface ServiceChargeFlowException {
  flowId: string;
}

export const useServiceChargeFlowExceptions = () =>
  useQuery<{ exceptions: ServiceChargeFlowException[] }>(
    FETCH_SERVICE_CHARGE_FLOW_EXCEPTIONS,
    {
      context: publicContext,
    },
  );

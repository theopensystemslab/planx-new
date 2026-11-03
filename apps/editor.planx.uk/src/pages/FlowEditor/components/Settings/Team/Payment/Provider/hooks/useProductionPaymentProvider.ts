import { gql, useQuery } from "@apollo/client";
import { useStore } from "pages/FlowEditor/lib/store";

import type {
  PaymentProviderResult,
  PaymentProviderVariables,
} from "../../../../../../../../hooks/usePaymentProvider";

export const GET_PRODUCTION_PAYMENT_PROVIDER = gql`
  query GetProductionPaymentProvider($teamId: Int!) {
    teamSettings: team_settings(where: { team_id: { _eq: $teamId } }) {
      paymentProvider: production_payment_provider
    }
  }
`;

export const useProductionPaymentProvider = () => {
  const teamId = useStore((state) => state.teamId);

  const result = useQuery<PaymentProviderResult, PaymentProviderVariables>(
    GET_PRODUCTION_PAYMENT_PROVIDER,
    {
      variables: { teamId },
      fetchPolicy: "cache-and-network",
    },
  );

  return {
    ...result,
    productionPaymentProvider: result.data?.teamSettings[0]?.paymentProvider,
  };
};

import { gql, useQuery } from "@apollo/client";
import type { PaymentProvider } from "pages/FlowEditor/components/Settings/Team/Payment/Provider";
import { useStore } from "pages/FlowEditor/lib/store";

export const GET_PAYMENT_PROVIDER = gql`
  query GetPaymentProvider($teamId: Int!) {
    teamSettings: team_settings(where: { team_id: { _eq: $teamId } }) {
      paymentProvider: payment_provider
    }
  }
`;

type PaymentProviderResult = {
  teamSettings: { paymentProvider: PaymentProvider }[];
};

type PaymentProviderVariables = {
  teamId: number;
};

export const usePaymentProvider = () => {
  const teamId = useStore((state) => state.teamId);

  const result = useQuery<PaymentProviderResult, PaymentProviderVariables>(
    GET_PAYMENT_PROVIDER,
    {
      variables: { teamId },
      fetchPolicy: "cache-and-network",
    },
  );

  return {
    ...result,
    paymentProvider: result.data?.teamSettings[0]?.paymentProvider,
  };
};

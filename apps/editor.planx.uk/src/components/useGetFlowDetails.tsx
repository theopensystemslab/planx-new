import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";

const GET_FLOW_DETAILS = gql`
  query GetFlow($teamSlug: String!, $flowSlug: String!) {
    flows(
      where: { team: { slug: { _eq: $teamSlug } }, slug: { _eq: $flowSlug } }
    ) {
      status
      isService: is_service
    }
  }
`;

export type GetFlowDetailsQuery = {
  flows: {
    status: "online" | "offline";
    isService: boolean;
  }[];
};

export type GetFlowDetailsVars = {
  teamSlug: string;
  flowSlug: string;
};

export const useGetFlowDetails = (
  teamSlug: string | undefined,
  flowSlug: string | undefined,
) =>
  useQuery<GetFlowDetailsQuery, GetFlowDetailsVars>(GET_FLOW_DETAILS, {
    variables: { teamSlug: teamSlug as string, flowSlug: flowSlug as string },
    fetchPolicy: "cache-and-network",
    skip: !teamSlug || !flowSlug, // hook must be unconditional, so we check for missing params here instead
  });

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";

const GET_FLOW_DETAILS = gql`
  query GetFlow($teamSlug: String!, $flowSlug: String!) {
    flows(
      where: { team: { slug: { _eq: $teamSlug } }, slug: { _eq: $flowSlug } }
    ) {
      id
      status
      isService: is_service
      isPattern: is_pattern
      isTemplate: is_template
      canCreateFromCopy: can_create_from_copy
    }
  }
`;

export type GetFlowDetailsQuery = {
  flows: {
    status: "online" | "offline";
    isService: boolean;
    isPattern: boolean;
    isTemplate: boolean;
    canCreateFromCopy: boolean;
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

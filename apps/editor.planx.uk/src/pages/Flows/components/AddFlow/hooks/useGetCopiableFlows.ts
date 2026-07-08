import { gql, useQuery } from "@apollo/client";

const GET_COPIABLE_FLOWS = gql`
  query GetCopiableFlows {
    copiableFlows: flows(
      where: {
        can_create_from_copy: { _eq: true }
        is_template: { _eq: false }
        archived_at: { _is_null: true }
      }
      order_by: { team: { name: asc }, name: asc }
    ) {
      id
      slug
      name
      team {
        name
      }
    }
  }
`;

interface GetCopiableFlows {
  copiableFlows: {
    id: string;
    slug: string;
    name: string;
    team: { name: string };
  }[];
}

type GetCopiableFlowsVars = Record<string, never>;

export const useGetCopiableFlows = () => {
  return useQuery<GetCopiableFlows, GetCopiableFlowsVars>(
    GET_COPIABLE_FLOWS,
    {},
  );
};

import { gql, useQuery } from "@apollo/client";

interface ExternalPortal {
  id: string;
  slug: string;
  name: string;
  team: {
    slug: string;
  };
}

const GET_EXTERNAL_PORTAL = gql`
  query GetExternalPortal($id: uuid!) {
    externalPortal: flows_by_pk(id: $id) {
      id
      slug
      name
      team {
        slug
      }
    }
  }
`;

export const useExternalPortal = (flowId?: string) => {
  const { data, loading } = useQuery<{ externalPortal: ExternalPortal | null }>(
    GET_EXTERNAL_PORTAL,
    {
      variables: { id: flowId },
      skip: !flowId,
    },
  );

  const flow = data?.externalPortal;
  const isCorrupted = !loading && !flow;

  const href = flow ? `${flow.team?.slug}/${flow.slug}` : "Loading...";

  return { flow, href, loading, isCorrupted };
};

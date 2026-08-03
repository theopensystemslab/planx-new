import { gql, useQuery } from "@apollo/client";

const GET_FEATURED_TEMPLATES = gql`
  query GetFeaturedTemplates {
    templates: flows(
      where: {
        is_template: { _eq: true }
        can_create_from_copy: { _eq: true }
        archived_at: { _is_null: true }
      }
      order_by: { updated_at: desc }
      limit: 4
    ) {
      id
      name
      summary
    }
  }
`;

export interface FeaturedTemplate {
  id: string;
  name: string;
  summary?: string | null;
}

interface GetFeaturedTemplates {
  templates: FeaturedTemplate[];
}

type GetFeaturedTemplatesVars = Record<string, never>;

export const useGetFeaturedTemplates = () => {
  return useQuery<GetFeaturedTemplates, GetFeaturedTemplatesVars>(
    GET_FEATURED_TEMPLATES,
    {},
  );
};

import gql from "graphql-tag";

export const GET_LPAS_QUERY = gql`
  query GetLPAs($teamSlugs: [String!]) {
    lpas: teams(
      order_by: { name: asc }
      where: { slug: { _in: $teamSlugs } }
    ) {
      name
      slug
      theme {
        logo
        primaryColour: primary_colour
      }
      domain
      applyServices: flows(
        where: {
          status: { _eq: online }
          is_listed_on_lps: { _eq: true }
          category: { _eq: "apply" }
        }
        order_by: { name: asc }
      ) {
        ...service
      }
      guidanceServices: flows(
        where: {
          status: { _eq: online }
          is_listed_on_lps: { _eq: true }
          category: { _eq: "guidance" }
        }
        order_by: { name: asc }
      ) {
        ...service
      }
      notifyServices: flows(
        where: {
          status: { _eq: online }
          is_listed_on_lps: { _eq: true }
          category: { _eq: "notify" }
        }
        order_by: { name: asc }
      ) {
        ...service
      }
    }
  }

  fragment service on flows {
    name
    slug
    summary
  }
`;

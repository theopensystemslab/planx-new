import gql from "graphql-tag";

export const GET_LPAS_QUERY = gql`
  query GetLPAs(
    $teamSlugs: [String!]
    $notifyServiceSlugs: [String!]
    $applicationServiceSlugs: [String!]
    $guidanceServiceSlugs: [String!]
  ) {
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
          slug: { _in: $applicationServiceSlugs }
          published_flows: { has_send_component: { _eq: true } }
        }
        order_by: { name: asc }
      ) {
        ...service
      }
      guidanceServices: flows(
        where: {
          status: { _eq: online }
          slug: { _in: $guidanceServiceSlugs }
          published_flows: { has_send_component: { _eq: false } }
        }
        order_by: { name: asc }
      ) {
        ...service
      }
      notifyServices: flows(
        where: {
          status: { _eq: online }
          slug: { _in: $notifyServiceSlugs }
          published_flows: { has_send_component: { _eq: true } }
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
    description
  }
`;

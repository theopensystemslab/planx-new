import gql from "graphql-tag";

export const GET_LPAS_QUERY = gql`
  query GetLPAs {
    lpas: teams(
      order_by: { name: asc }
      where: {
        category: { _eq: lpa }
        team_settings: { _not: { is_trial: { _eq: true } } }
      }
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

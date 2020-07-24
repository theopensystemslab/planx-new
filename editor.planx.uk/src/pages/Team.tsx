import { gql, useQuery } from "@apollo/client";
import React from "react";

const GET_TEAM = gql`
  query GetTeam($slug: String!) {
    v1_teams(
      order_by: { name: asc }
      limit: 1
      where: { slug: { _eq: $slug } }
    ) {
      id
      name
      slug
      flows(order_by: { updated_at: desc }) {
        slug
        updated_at
      }
    }
  }
`;

const Team: React.FC<{ slug: string }> = ({ slug }) => {
  const { loading, error, data } = useQuery(GET_TEAM, {
    variables: {
      slug,
    },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  const team = data.v1_teams[0];

  return <h1>{team.name}</h1>;
};

export default Team;

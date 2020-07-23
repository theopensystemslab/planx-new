import { gql, useQuery } from "@apollo/client";
import React from "react";

const GET_TEAMS = gql`
  query {
    teams {
      name
    }
  }
`;

const Teams: React.FC = () => {
  const { loading, error, data } = useQuery(GET_TEAMS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return data.teams.map(({ name }: any) => <div key={name}>{name}</div>);
};

export default Teams;

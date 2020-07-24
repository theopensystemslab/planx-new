import React from "react";

const Teams: React.FC<{ teams: any }> = ({ teams }) => (
  <>
    {teams.map(({ name }: any) => (
      <div key={name}>{name}</div>
    ))}
  </>
);

export default Teams;

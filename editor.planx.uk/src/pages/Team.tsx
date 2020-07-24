import React from "react";

const Team: React.FC<{ name: string; flows: any }> = ({ name, flows }) => (
  <>
    <h1>{name}</h1>
    {flows.map((flow) => (
      <h1 key={flow.id}>{flow.id}</h1>
    ))}
  </>
);

export default Team;

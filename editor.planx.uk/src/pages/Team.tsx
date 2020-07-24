import React from "react";
import { Link } from "react-navi";

const Team: React.FC<{ name: string; flows: any }> = ({ name, flows }) => (
  <>
    <h1>{name}</h1>
    {flows.map((flow) => (
      <Link key={flow.slug} href={`./${flow.slug}`}>
        {flow.slug}
      </Link>
    ))}
  </>
);

export default Team;

import React from "react";
import { Link } from "react-navi";
import { api } from "./FlowEditor/lib/store";

const Team: React.FC<{ name: string; flows: any; id }> = ({
  name,
  flows,
  id,
}) => (
  <>
    <h1>{name}</h1>
    {flows.map((flow) => (
      <Link key={flow.slug} href={`./${flow.slug}`}>
        {flow.slug}
      </Link>
    ))}
    <button
      onClick={() => {
        const newFlowName = prompt("Flow name");
        if (newFlowName) api.getState().createFlow(id, newFlowName);
      }}
    >
      New Flow
    </button>
  </>
);

export default Team;

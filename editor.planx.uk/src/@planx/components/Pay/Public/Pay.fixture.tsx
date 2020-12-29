import React from "react";

import Pay from "./Pay";

export default function Fixture() {
  return (
    <Pay
      handleSubmit={console.log}
      title="Pay"
      description=""
      color="#efefef"
    />
  );
}

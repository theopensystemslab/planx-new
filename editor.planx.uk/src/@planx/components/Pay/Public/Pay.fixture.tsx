import React from "react";

import Pay from "./Pay";

export default function Fixture() {
  return (
    <Pay
      handleSubmit={console.log}
      title="Pay"
      description=""
      fn="application.fee.payable"
      color="#efefef"
      govPayMetadata={[]}
    />
  );
}

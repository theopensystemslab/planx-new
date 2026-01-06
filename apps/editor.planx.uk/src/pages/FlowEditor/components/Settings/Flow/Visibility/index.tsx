import React from "react";
import { Route } from "routes/_authenticated/$team/$flow/settings/visibility";

import FlowCopy from "./FlowCopy";
import FlowStatus from "./FlowStatus";
import LPSListing from "./LPS";

const VisibilitySettings: React.FC = () => {
  const { flowStatusData } = Route.useLoaderData();

  return (
    <>
      <FlowStatus preloadedData={flowStatusData} />
      <FlowCopy />
      <LPSListing />
    </>
  );
};

export default VisibilitySettings;

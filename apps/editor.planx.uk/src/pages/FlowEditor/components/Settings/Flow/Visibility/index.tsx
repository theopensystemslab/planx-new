import React from "react";

import FlowCopy from "./FlowCopy";
import FlowStatus from "./FlowStatus";
import LPSListing from "./LPS";

const VisibilitySettings: React.FC = () => (
  <>
    <FlowStatus />
    <FlowCopy />
    <LPSListing />
  </>
);

export default VisibilitySettings;

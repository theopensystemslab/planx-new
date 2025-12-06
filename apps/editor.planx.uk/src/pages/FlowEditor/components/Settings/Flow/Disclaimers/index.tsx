import React from "react";

import GuidanceDisclaimer from "./components/Guidance";
import ResultDisclaimer from "./components/Result";

const Disclaimers: React.FC = () => (
  <>
    <ResultDisclaimer />
    <GuidanceDisclaimer />
  </>
);

export default Disclaimers;

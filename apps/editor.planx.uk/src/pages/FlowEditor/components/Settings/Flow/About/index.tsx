import React from "react";

import Description from "./components/Description";
import ExternalPortalList from "./components/ExternalPortalList";
import Limitations from "./components/Limitations";
import Summary from "./components/Summary";

const About: React.FC = () => (
  <>
    <Summary />
    <Description />
    <Limitations />
    <ExternalPortalList />
  </>
);

export default About;

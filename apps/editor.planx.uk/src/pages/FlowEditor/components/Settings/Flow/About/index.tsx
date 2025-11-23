import React from "react";

import Description from "./components/Description";
import Limitations from "./components/Limitations";
import Summary from "./components/Summary";

const About: React.FC = () => (
  <>
    <Summary />
    <Description />
    <Limitations />
  </>
);

export default About;

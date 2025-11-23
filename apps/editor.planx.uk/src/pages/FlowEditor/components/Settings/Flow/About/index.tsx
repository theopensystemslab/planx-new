import React from "react";

import Description from "./Description";
import Limitations from "./Limitations";
import Summary from "./Summary";

const About: React.FC = () => (
  <>
    <Summary />
    <Description />
    <Limitations />
  </>
);

export default About;

import { useStore } from "pages/FlowEditor/lib/store";

import Description from "./components/Description";
import ExternalPortalList from "./components/ExternalPortalList";
import Limitations from "./components/Limitations";
import Summary from "./components/Summary";

const About: React.FC = () => {
  const isPattern = useStore((state) => state.isPattern);

  if (isPattern) return <Summary />;

  return (
    <>
      <Summary />
      <Description />
      <Limitations />
      <ExternalPortalList />
    </>
  );
};

export default About;

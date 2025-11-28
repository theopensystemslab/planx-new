import type { PublicProps } from "@planx/components/shared/types";

import type { AgentForTask } from "../../types";

type Props = PublicProps<AgentForTask<"enhanceProjectDescription">>;

const EnhanceProjectDescriptions: React.FC<Props> = () => {
  /**
   * TODO:
   *  - Check if `project.description` in passport (or read fn from node?)
   *    - Auto answer if not present, log error?
   *  - Fetch data from API
   *  - Allow use to select suggested or original
   */

  return "Enhanced!";
};

export default EnhanceProjectDescriptions;

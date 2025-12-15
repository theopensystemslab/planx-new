import type { PublicProps } from "@planx/components/shared/types";

import type { EnhancedTextInputForTask } from "../../types";

type Props = PublicProps<EnhancedTextInputForTask<"projectDescription">>;

const ProjectDescription: React.FC<Props> = () => {
  /**
   * TODO:
   *  - Show TextInput
   *  - Accept user input
   *  - Hit API
   *  - Allow use to select suggested or original
   */

  return "Enhanced!";
};

export default ProjectDescription;
import type { PublicProps } from "@planx/components/shared/types";
import React from "react";

import BaseQuestionComponent from "../shared/BaseQuestion/Public";
import type { ResponsiveQuestionWithOptions } from "./model";

export type Props = PublicProps<ResponsiveQuestionWithOptions>;

const ResponsiveQuestion = (props: Props) => {
  // TODO: hook

  return <BaseQuestionComponent {...props} options={filteredOptions} />;
};

export default ResponsiveQuestion;

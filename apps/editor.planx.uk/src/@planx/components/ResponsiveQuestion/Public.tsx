import type { PublicProps } from "@planx/components/shared/types";
import React from "react";

import BaseQuestionComponent from "../shared/BaseQuestion/Public";
import { useConditionalResponses } from "../shared/RuleBuilder/hooks/useConditionalResponses";
import type { ResponsiveQuestionWithOptions } from "./model";

export type Props = PublicProps<ResponsiveQuestionWithOptions>;

const ResponsiveQuestion = (props: Props) => {
  const conditionalOptions = useConditionalResponses(props.options);
  if (!conditionalOptions) return null;

  return <BaseQuestionComponent {...props} options={conditionalOptions} />;
};

export default ResponsiveQuestion;

import type { PublicProps } from "@planx/components/shared/types";
import React from "react";

import BaseQuestionComponent from "../shared/BaseQuestion/Public";
import { useConditionalOptions } from "../shared/RuleBuilder/hooks/useConditionalResponses";
import type { ResponsiveQuestionWithOptions } from "./model";

export type Props = PublicProps<ResponsiveQuestionWithOptions>;

const ResponsiveQuestion = (props: Props) => {
  const { conditionalOptions } = useConditionalOptions(props.options);
  if (!conditionalOptions) return null;

  return <BaseQuestionComponent {...props} options={conditionalOptions} />;
};

export default ResponsiveQuestion;

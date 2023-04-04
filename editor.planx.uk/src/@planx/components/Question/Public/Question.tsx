import { hasFeatureFlag } from "lib/featureFlags";
import { Store } from "pages/FlowEditor/lib/store";
import { handleSubmit } from "pages/Preview/Node";
import React from "react";

import ButtonQuestion from "./ButtonQuestion";
import RadioQuestion from "./RadioQuestion";

export interface IQuestion {
  id?: string;
  text?: string;
  description?: string;
  info?: string;
  policyRef?: string;
  howMeasured?: string;
  definitionImg?: string;
  img?: string;
  responses: {
    id: string;
    responseKey: string | number;
    title: string;
    description?: string;
    img?: string;
  }[];
  previouslySubmittedData?: Store.userData;
  handleSubmit: handleSubmit;
}

export enum QuestionLayout {
  Basic,
  Images,
  Descriptions,
}

const Question: React.FC<IQuestion> = (props) => {
  const isUsingAltTheme = hasFeatureFlag("ALT_THEME");

  return isUsingAltTheme ? (
    <RadioQuestion {...props} />
  ) : (
    <ButtonQuestion {...props} />
  );
};

export default Question;

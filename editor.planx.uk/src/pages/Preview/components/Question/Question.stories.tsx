import { Meta } from "@storybook/react/types-6-0";
import React from "react";

import Question, { IQuestion } from "./Question";

export default {
  title: "PlanX Components/Question",
  component: Question,
  argTypes: {
    handleSubmit: { action: true, control: { disable: true } },
  },
} as Meta;

export const Basic = (args: IQuestion) => <Question {...args} />;
Basic.args = {
  text: "What is your favorite fruit?",
  description:
    "A fruit is the sweet and fleshy product of a tree or other plant that contains seed and can be eaten as food.",
  info: "Some info here",
  policyRef: "Policy ref here",
  howMeasured: "How is it measured",
  responses: [
    { id: "a", responseKey: "a", title: "Apple" },
    { id: "b", responseKey: "b", title: "Banana" },
    { id: "c", responseKey: "c", title: "Canteloupe" },
  ],
} as IQuestion;

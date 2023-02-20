import { Meta, Story } from "@storybook/react/types-6-0";
import React from "react";

import Question, { IQuestion } from "./Question";

const metadata: Meta = {
  title: "PlanX Components/Question",
  component: Question,
  argTypes: {
    handleSubmit: { action: true, control: { disable: true } },
  },
};

const Template = (args: IQuestion) => <Question {...args} />;

export const Basic: Story<IQuestion> = Template.bind({});
const basicArgs: IQuestion = {
  text: "What is your favorite fruit?",
  description:
    "A fruit is the sweet and fleshy product of a tree or other plant that contains seed and can be eaten as food.",
  info: "Some info here",
  policyRef: "Policy ref here",
  howMeasured: "How is it measured",
  handleSubmit: () => {},
  responses: [
    { id: "a", responseKey: "a", title: "Apple" },
    { id: "b", responseKey: "b", title: "Banana" },
    { id: "c", responseKey: "c", title: "Canteloupe" },
  ],
};
Basic.args = basicArgs;

export const WithDescriptions: Story<IQuestion> = Template.bind({});
const descArgs: IQuestion = {
  ...basicArgs,
  responses: [
    { id: "a", responseKey: "a", title: "Apple", description: "la la la" },
    { id: "b", responseKey: "b", title: "Banana" },
    { id: "c", responseKey: "c", title: "Canteloupe" },
  ],
};
WithDescriptions.args = descArgs;

export const WithImages: Story<IQuestion> = Template.bind({});
const imagesArgs: IQuestion = {
  ...basicArgs,
  responses: [
    {
      id: "a",
      responseKey: "a",
      title: "Apple",
      img: "https://i2.wp.com/ceklog.kindel.com/wp-content/uploads/2013/02/firefox_2018-07-10_07-50-11.png",
    },
    { id: "b", responseKey: "b", title: "Banana" },
    { id: "c", responseKey: "c", title: "Canteloupe" },
  ],
};
WithImages.args = imagesArgs;

export default metadata;

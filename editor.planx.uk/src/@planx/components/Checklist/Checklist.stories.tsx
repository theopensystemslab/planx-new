import type { StoryFn } from "@storybook/react";
import React from "react";

import type { Props } from "./Public";
import Checklist from "./Public";

export default {
  title: "PlanX Components/Checklist",
  component: Checklist,
  argTypes: {
    handleSubmit: { action: true, control: { disable: true } },
    allRequired: {
      control: "boolean",
      description:
        "Toggles whether or not all checks must be selected before proceeding",
    },
  },
};

const Template: StoryFn<Props> = (args: Props) => <Checklist {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  text: "Which fruits are you interested in?",
  description:
    "A fruit is the sweet and fleshy product of a tree or other plant that contains seed and can be eaten as food.",
  info: "Some info here",
  policyRef: "Policy ref here",
  howMeasured: "How it is measured",
  options: [
    { id: "a", data: { val: "a", text: "Apples" } },
    { id: "b", data: { val: "b", text: "Bananas" } },
    { id: "c", data: { val: "c", text: "Canteloupes" } },
  ],
};

export const Grouped = Template.bind({});
Grouped.args = {
  text: "Which plant-based food items are you interested in?",
  description:
    "A fruit is the sweet and fleshy product of a tree or other plant that contains seed and can be eaten as food.",
  info: "Some info here",
  policyRef: "Policy ref here",
  howMeasured: "How it is measured",
  groupedOptions: [
    {
      title: "Fruits",
      children: [
        { id: "a", data: { val: "a", text: "Apples" } },
        { id: "b", data: { val: "b", text: "Bananas" } },
        { id: "c", data: { val: "c", text: "Canteloupes" } },
      ],
    },
    {
      title: "Vegetables",
      children: [
        { id: "1", data: { val: "a", text: "Amaranth" } },
        { id: "2", data: { val: "b", text: "Beans" } },
        { id: "3", data: { val: "c", text: "Carrots" } },
      ],
    },
  ],
};

export const WithImages = Template.bind({});
WithImages.args = {
  text: "Which fruits are you interested in?",
  description:
    "A fruit is the sweet and fleshy product of a tree or other plant that contains seed and can be eaten as food.",
  info: "Some info here",
  policyRef: "Policy ref here",
  howMeasured: "How it is measured",
  options: [
    {
      id: "a",
      data: {
        val: "a",
        text: "Apples",
        img: "https://www.applesfromny.com/wp-content/uploads/2020/05/Jonagold_NYAS-Apples2.png",
      },
    },
    {
      id: "b",
      data: {
        val: "b",
        text: "Bananas",
        img: "https://images.everydayhealth.com/images/diet-nutrition/how-many-calories-are-in-a-banana-1440x810.jpg",
      },
    },
    { id: "c", data: { val: "c", text: "Canteloupes" } },
  ],
};

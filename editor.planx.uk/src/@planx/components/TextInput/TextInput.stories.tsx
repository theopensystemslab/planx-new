import { Meta, StoryObj } from "@storybook/react";
import { userEvent, within } from "@storybook/testing-library";
import React from "react";

import Wrapper from "../fixtures/Wrapper";
import Editor from "./Editor";
import { TextInputType } from "./model";
import Public from "./Public";

export default {
  title: "PlanX Components/TextInput",
  component: Public,
  argTypes: {
    type: {
      control: { type: "radio" },
      options: [
        TextInputType.Short,
        TextInputType.Long,
        TextInputType.ExtraLong,
        TextInputType.Email,
        TextInputType.Phone,
      ],
    },
  },
} as Meta;

export const EmptyFormShortText: StoryObj = {
  args: {
    title: "What is your name?",
    type: TextInputType.Short,
  },
};

export const EmptyFormLongText: StoryObj = {
  args: {
    title: "Describe your project",
    description: "Be as descriptive as you can. You have 250 characters.",
    type: TextInputType.Long,
  },
};

export const EmptyFormExtraLongText: StoryObj = {
  args: {
    title: "Describe your project",
    description: "Be as descriptive as you can. You have 500 characters.",
    type: TextInputType.ExtraLong,
  },
};

export const EmptyFormEmail: StoryObj = {
  args: {
    title: "What is your email?",
    type: TextInputType.Email,
  },
};

export const EmptyFormPhone: StoryObj = {
  args: {
    title: "What is your phone number?",
    type: TextInputType.Phone,
  },
};

export const EmptyFormWithHelpText: StoryObj = {
  args: {
    ...EmptyFormShortText.args,
    howMeasured: "This is an example definition",
  },
};

export const FilledForm: StoryObj = {
  ...EmptyFormEmail,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const emailInput = canvas.getByLabelText("What is your email?", {
      selector: "input",
    });
    await userEvent.type(emailInput, "Invalid email format", {
      delay: 100,
    });

    // click submit, expect validation error to show
    const submitButton = canvas.getByRole("button");
    await userEvent.click(submitButton);
  },
};

export const WithEditor = () => {
  return <Wrapper Editor={Editor} Public={Public} />;
};

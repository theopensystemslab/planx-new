import { Meta, StoryObj } from "@storybook/react";
import { userEvent, within } from "@storybook/testing-library";
import React from "react";

import Wrapper from "../fixtures/Wrapper";
import Editor from "./Editor";
import Public from "./Public";

export default {
  title: "PlanX Components/DateInput",
  component: Public,
} as Meta;

export const EmptyForm: StoryObj = {
  args: {
    title: "When will your project start?",
    description: "It must be before 31 December 2024",
    min: "2000-01-01",
    max: "2024-12-31",
  },
};

export const EmptyFormWithHelpText: StoryObj = {
  args: {
    ...EmptyForm.args,
    howMeasured: "This is an example definition.",
  },
};

export const FilledForm: StoryObj = {
  ...EmptyForm,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const dayInput = canvas.getByPlaceholderText("DD");
    await userEvent.type(dayInput, "01", {
      delay: 100,
    });

    const monthInput = canvas.getByPlaceholderText("MM");
    await userEvent.type(monthInput, "03", {
      delay: 100,
    });

    const yearInput = canvas.getByPlaceholderText("YYYY");
    await userEvent.type(yearInput, "2030", {
      delay: 100,
    });

    // click submit, expect validation errors to show
    const submitButton = canvas.getByRole("button");
    await userEvent.click(submitButton);
  },
};

export const WithEditor = () => {
  return <Wrapper Editor={Editor} Public={Public} />;
};

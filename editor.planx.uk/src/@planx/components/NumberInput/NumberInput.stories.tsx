import { Meta, StoryObj } from "@storybook/react";
import { userEvent, within } from "@storybook/testing-library";
import React from "react";

import Wrapper from "../fixtures/Wrapper";
import Editor from "./Editor";
import Public from "./Public";

export default {
  title: "PlanX Components/NumberInput",
  component: Public,
} as Meta;

export const EmptyForm: StoryObj = {
  args: {
    title: "How tall is the doorway?",
    description: "Round to the nearest centimeter",
    units: "cm",
  },
};

export const EmptyFormWithHelpText: StoryObj = {
  args: {
    ...EmptyForm.args,
    howMeasured: "This is an example definition",
  },
};

export const FilledForm: StoryObj = {
  ...EmptyForm,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const numberInput = canvas.getByLabelText("How tall is the doorway?", {
      selector: "input",
    });
    await userEvent.type(numberInput, "220", {
      delay: 100,
    });

    const submitButton = canvas.getByRole("button");
    await userEvent.click(submitButton);
  },
};

export const WithEditor = () => {
  return <Wrapper Editor={Editor} Public={Public} />;
};

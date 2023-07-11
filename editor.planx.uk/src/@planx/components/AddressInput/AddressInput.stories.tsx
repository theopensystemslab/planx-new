import { Meta, StoryObj } from "@storybook/react";
import { userEvent, within } from "@storybook/testing-library";
import React from "react";

import Wrapper from "../fixtures/Wrapper";
import Editor from "./Editor";
import Public from "./Public";

const meta = {
  title: "PlanX Components/AddressInput",
  component: Public,
} satisfies Meta<typeof Public>;

type Story = StoryObj<typeof meta>;

export default meta;

export const EmptyForm = {
  args: {
    title: "Enter your address",
    description: "It might be where you live",
  },
} satisfies Story;

export const EmptyFormWithHelpText = {
  args: {
    ...EmptyForm.args,
    howMeasured: "This is an example definition.",
  },
} satisfies Story;

export const FilledForm = {
  ...EmptyForm,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const line1Input = canvas.getByLabelText("Address line 1", {
      selector: "input",
    });
    await userEvent.type(line1Input, "123 Main Street", {
      delay: 100,
    });

    const townInput = canvas.getByLabelText("Town", {
      selector: "input",
    });
    await userEvent.type(townInput, "London", {
      delay: 100,
    });

    // click submit before all required fields are filled out, expect validation errors to show
    const submitButton = canvas.getByRole("button");
    await userEvent.click(submitButton);
  },
} satisfies Story;

export const WithEditor = () => {
  return <Wrapper Editor={Editor} Public={Public} />;
};

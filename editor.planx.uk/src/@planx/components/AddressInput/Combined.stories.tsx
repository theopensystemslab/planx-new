import { Meta, StoryObj } from "@storybook/react";
import { userEvent, within } from "@storybook/testing-library";
import React from "react";

import Wrapper from "../fixtures/Wrapper";
import Editor from "./Editor";
import Public from "./Public";

export default {
  title: "Planx components/AddressInput",
  component: Public,
} as Meta;

export const EmptyForm: StoryObj = {
  args: {
    title: "Enter your address",
    description: "It might be where you live",
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

    const submitButton = canvas.getByRole("button");
    await userEvent.click(submitButton);
  },
};

export const WithEditor = () => {
  return <Wrapper Editor={Editor} Public={Public} />;
};

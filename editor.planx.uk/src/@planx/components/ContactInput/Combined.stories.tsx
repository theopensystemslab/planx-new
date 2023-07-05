import { Meta, StoryObj } from "@storybook/react";
import { userEvent, within } from "@storybook/testing-library";
import React from "react";

import Wrapper from "../fixtures/Wrapper";
import Editor from "./Editor";
import Public from "./Public";

export default {
  title: "PlanX Components/ContactInput",
  component: Public,
} as Meta;

export const EmptyForm: StoryObj = {
  args: {
    title: "Enter your contact details",
    description: "We won't share it with anyone else",
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

    const firstNameInput = canvas.getByLabelText("First name", {
      selector: "input",
    });
    await userEvent.type(firstNameInput, "Jess", {
      delay: 100,
    });

    const emailInput = canvas.getByLabelText("Email address", {
      selector: "input",
    });
    await userEvent.type(emailInput, "Invalid email format", {
      delay: 100,
    });

    // click submit before all required fields are filled out, expect validation errors to show
    const submitButton = canvas.getByRole("button");
    await userEvent.click(submitButton);
  },
};

export const WithEditor = () => {
  return <Wrapper Editor={Editor} Public={Public} />;
};

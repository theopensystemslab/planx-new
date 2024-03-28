import { Meta, StoryObj } from "@storybook/react";
import { userEvent, within } from "@storybook/testing-library";

import FeedbackForm from "./FeedbackForm";

const meta: Meta<typeof FeedbackForm> = {
  title: "Design System/Molecules/FeedbackForm",
  component: FeedbackForm,
};

type Story = StoryObj<typeof meta>;

export default meta;

export const EmptyLabelledForm: Story = {
  args: {
    inputs: [
      { id: "userContext", name: "userContext", label: "What were you doing?" },
      { id: "userComment", name: "userComment", label: "What went wrong?" },
    ],
    handleSubmit: async (values) => {
      console.log(values);
    },
  },
};

export const EmptyUnlabelledForm: Story = {
  args: {
    inputs: [
      { id: "userComment", name: "userComment", label: "What's your comment?" },
    ],
    handleSubmit: async (values) => {
      console.log(values);
    },
  },
};

export const SuccessfulLabelledFormSubmit: Story = {
  ...EmptyLabelledForm,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const contextInput = canvas.getByLabelText("What were you doing?");
    await userEvent.type(contextInput, "Trying to find my property", {
      delay: 100,
    });

    const commentInput = canvas.getByLabelText("What went wrong?");
    await userEvent.type(
      commentInput,
      "It said I own a house but it's actually a flat.",
      { delay: 100 },
    );

    const submitButton = canvas.getByRole("button", { name: "Send feedback" });
    await userEvent.click(submitButton);
  },
};

export const MissingInputLabelledForm: Story = {
  ...EmptyLabelledForm,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const contextInput = canvas.getByLabelText("What were you doing?");
    await userEvent.type(contextInput, "Trying to find my property", {
      delay: 100,
    });

    const submitButton = canvas.getByRole("button", { name: "Send feedback" });
    await userEvent.click(submitButton);
  },
};

export const SuccessfulUnlabelledFormSubmit: Story = {
  ...EmptyUnlabelledForm,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const commentInput = canvas.getByLabelText("Leave your feedback");
    await userEvent.type(
      commentInput,
      "It said I own a house but it's actually a flat.",
      { delay: 100 },
    );

    const submitButton = canvas.getByRole("button", { name: "Send feedback" });
    await userEvent.click(submitButton);
  },
};

export const MissingInputUnlabelledFormSubmit: Story = {
  ...EmptyUnlabelledForm,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const submitButton = canvas.getByRole("button", { name: "Send feedback" });
    await userEvent.click(submitButton);
  },
};

import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within, expect } from "@storybook/test";
import { http, HttpResponse, delay } from "msw";
import LoginForm from "./LoginForm";
import { handlers, loginErrorHandlers } from "../../../.storybook/mocks/handlers";

const meta = {
  title: "Molecules/LoginForm",
  component: LoginForm,
  parameters: {
    layout: "padded",
    msw: { handlers },
  },
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default idle state */
export const Default: Story = {};

/**
 * play() types an email and clicks Submit
 * MSW holds the response indefinitely, so the button stays in "Submitting..." state
 */
export const Submitting: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post("*/lps/login", async () => {
          await delay("infinite");
          return HttpResponse.json({});
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText(/email/i), "test@example.com");
    canvas.getByRole("button", { name: /submit/i }).click();
  },
};

/**
 * play() submits the form
 * MSW returns a 500 so that an error message appears
 */
export const WithError: Story = {
  parameters: {
    msw: { handlers: loginErrorHandlers },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText(/email/i), "test@example.com");
    await userEvent.click(canvas.getByRole("button", { name: /submit/i }));
    await expect(canvas.getByRole("alert")).toBeInTheDocument();
  },
};

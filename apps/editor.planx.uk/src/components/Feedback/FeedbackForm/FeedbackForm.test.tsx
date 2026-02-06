import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import { FeedbackFormInput } from "../types";
import FeedbackForm from "./FeedbackForm";

const mockHandleSubmit = vi.fn();

const mockLabelledInputs: FeedbackFormInput[] = [
  { name: "userContext", id: "userContext", label: "User Context" },
  { name: "userComment", id: "userComment", label: "User Comment" },
];

vi.mock("hooks/usePublicRouteContext", () => ({
  usePublicRouteContext: vi.fn(() => "/$flow"),
}));

describe("FeedbackForm functionality", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders inputs correctly", async () => {
    const { getByLabelText } = await setup(
      <FeedbackForm
        inputs={mockLabelledInputs}
        handleSubmit={mockHandleSubmit}
      />,
    );
    const contextInput = getByLabelText("User Context");
    const commentInput = getByLabelText("User Comment");
    expect(contextInput).toBeInTheDocument();
    expect(commentInput).toBeInTheDocument();
  });

  test("can submit inputs", async () => {
    const { getByLabelText, getByText, user } = await setup(
      <FeedbackForm
        inputs={mockLabelledInputs}
        handleSubmit={mockHandleSubmit}
      />,
    );

    await user.type(getByLabelText("User Context"), "This is test context");
    await user.type(getByLabelText("User Comment"), "This is a test comment");
    await user.click(getByText("Send feedback"));

    expect(mockHandleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        userContext: "This is test context",
        userComment: "This is a test comment",
      }),
      expect.any(Object),
    );
  });
});

describe("FeedbackForm accessibility tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders inputs with no accessibility violations", async () => {
    const { container } = await setup(
      <FeedbackForm
        inputs={mockLabelledInputs}
        handleSubmit={mockHandleSubmit}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

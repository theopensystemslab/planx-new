import React from "react";
import { axe, setup } from "testUtils";

import { FeedbackFormInput } from ".";
import FeedbackForm from "./FeedbackForm";

const mockHandleSubmit = jest.fn();

const mockLabelledInputs: FeedbackFormInput[] = [
  { name: "userContext", id: "userContext", label: "User Context" },
  { name: "userComment", id: "userComment", label: "User Comment" },
];

describe("FeedbackForm functionality", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders inputs correctly", () => {
    const { getByLabelText } = setup(
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
    const { getByLabelText, getByText, user } = setup(
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
    jest.clearAllMocks();
  });

  test("renders inputs with no accessibility violations", async () => {
    const { container } = setup(
      <FeedbackForm
        inputs={mockLabelledInputs}
        handleSubmit={mockHandleSubmit}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

import React from "react";
import { axe, setup } from "testUtils";

import { FeedbackFormInput } from ".";
import FeedbackForm from "./FeedbackForm";

const mockHandleSubmit = jest.fn();

const mockUnlabelledInput: FeedbackFormInput[] = [
  {
    name: "userComment",
    ariaDescribedBy: "comment-title",
  },
];

const mockLabelledInputs: FeedbackFormInput[] = [
  { name: "userContext", id: "userContext", label: "User Context" },
  { name: "userComment", id: "userComment", label: "User Comment" },
];

describe("FeedbackForm functionality", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders unlabelled input correctly", () => {
    const { getByLabelText } = setup(
      <FeedbackForm
        inputs={mockUnlabelledInput}
        handleSubmit={mockHandleSubmit}
      />,
    );
    const renderedInput = getByLabelText("Leave your feedback");
    expect(renderedInput).toBeInTheDocument();
  });

  test("renders labelled inputs correctly", () => {
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

  test("renders the feedback disclaimer with the input", () => {
    const { getByText } = setup(
      <FeedbackForm
        inputs={mockUnlabelledInput}
        handleSubmit={mockHandleSubmit}
      />,
    );
    expect(
      getByText(
        /Do not share personal or financial information in your feedback./i,
      ),
    ).toBeInTheDocument();
  });

  test("can submit an unlabelled input", async () => {
    const { getByLabelText, getByText, user } = setup(
      <FeedbackForm
        inputs={mockUnlabelledInput}
        handleSubmit={mockHandleSubmit}
      />,
    );
    await user.type(
      getByLabelText("Leave your feedback"),
      "This is a test comment",
    );
    await user.click(getByText("Send feedback"));

    expect(mockHandleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        userComment: "This is a test comment",
      }),
      expect.any(Object),
    );
  });

  test("can submit labelled inputs", async () => {
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

  test("renders unlabelled inputs with no accessibility violations", async () => {
    const { container } = setup(
      <FeedbackForm
        inputs={mockUnlabelledInput}
        handleSubmit={mockHandleSubmit}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("renders labelled inputs with no accessibility violations", async () => {
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

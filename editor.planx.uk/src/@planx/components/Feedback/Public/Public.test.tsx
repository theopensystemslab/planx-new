import { screen } from "@testing-library/react";
import {
  getInternalFeedbackMetadata,
  insertFeedbackMutation,
} from "lib/feedback";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import FeedbackComponent from "./Public";

describe("when the Feedback component is rendered", async () => {
  it("should not have any accessibility violations", async () => {
    const { container } = setup(<FeedbackComponent feedbackRequired={false} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

const handleSubmit = vi.fn();
vi.mock("lib/feedback", () => ({
  getInternalFeedbackMetadata: vi.fn(),
  insertFeedbackMutation: vi.fn(),
}));

describe("when the user only submits a rating on a feedback component where feedback is not required", async () => {
  beforeEach(async () => {
    const { user } = setup(
      <FeedbackComponent
        handleSubmit={handleSubmit}
        feedbackRequired={false}
      />,
    );
    await user.click(screen.getByTestId("feedback-button-terrible"));
    await user.click(screen.getByTestId("continue-button"));
  });

  it("should call the handleSubmit function with the correct data", async () => {
    expect(getInternalFeedbackMetadata).toBeCalled();
    expect(insertFeedbackMutation).toBeCalledWith({
      feedbackScore: 1,
      feedbackType: "component",
      userComment: "",
    });
  });
});

describe("when the user only submits a comment on a feedback component where feedback is not required", async () => {
  beforeEach(async () => {
    const { user } = setup(
      <FeedbackComponent
        handleSubmit={handleSubmit}
        feedbackRequired={false}
      />,
    );
    const textInput = screen.getByTestId("user-comment");
    await user.type(textInput, "I had a great time");
    await user.click(screen.getByTestId("continue-button"));
  });

  it("should call the handleSubmit function with the correct data", async () => {
    expect(getInternalFeedbackMetadata).toBeCalled();
    expect(insertFeedbackMutation).toBeCalledWith({
      feedbackScore: "",
      feedbackType: "component",
      userComment: "I had a great time",
    });
  });
});

describe("when the user does not submit any data on a feedback component where feedback is not required", async () => {
  beforeEach(async () => {
    const { user } = setup(
      <FeedbackComponent
        handleSubmit={handleSubmit}
        feedbackRequired={false}
      />,
    );
    await user.click(screen.getByTestId("continue-button"));
  });

  it("should call the handleSubmit function with the correct data", async () => {
    expect(getInternalFeedbackMetadata).toBeCalled();
    expect(insertFeedbackMutation).toBeCalledWith({
      feedbackScore: "",
      feedbackType: "component",
      userComment: "",
    });
  });
});

describe("when feedback is required but the user does not submit any data", async () => {
  beforeEach(async () => {
    const { user } = setup(
      <FeedbackComponent handleSubmit={handleSubmit} feedbackRequired={true} />,
    );
    await user.click(screen.getByTestId("continue-button"));
  });

  it("displays an appropriate error message for each missing field", async () => {
    const errorMessages = [
      "Please provide a feedback score",
      "Enter your feedback",
    ];
    errorMessages.map((error) => {
      expect(screen.getByText(error)).toBeVisible();
    });
  });
});

// somethhing about recovering state when pressing the back button

// should be navigable by keyboard

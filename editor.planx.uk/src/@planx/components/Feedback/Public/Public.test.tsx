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

const handleSubmit = vi.fn();
vi.mock("lib/feedback", () => ({
  getInternalFeedbackMetadata: vi.fn(),
  insertFeedbackMutation: vi.fn(),
}));

describe("when the Feedback component is rendered", async () => {
  it("should not have any accessibility violations", async () => {
    const { container } = setup(
      <FeedbackComponent
        title="Tell us what you think"
        feedbackRequired={false}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  it("should call handleSubmit when the continue button is pressed", async () => {
    const { user } = setup(
      <FeedbackComponent
        title="Tell us what you think"
        handleSubmit={handleSubmit}
        feedbackRequired={false}
      />,
    );

    await user.click(screen.getByTestId("feedback-button-terrible"));
    await user.click(screen.getByTestId("continue-button"));

    expect(getInternalFeedbackMetadata).toBeCalled();
    expect(insertFeedbackMutation).toBeCalled();
  });
});

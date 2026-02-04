import { screen } from "@testing-library/react";
import {
  getInternalFeedbackMetadata,
  insertFeedbackMutation,
} from "lib/feedback";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import FeedbackComponent from "../Public";

vi.mock("lib/feedback", () => ({
  getInternalFeedbackMetadata: vi.fn(),
  insertFeedbackMutation: vi.fn(),
}));

describe("when the Feedback component is rendered", async () => {
  it("should not have any accessibility violations", async () => {
    const { container } = await setup(
      <FeedbackComponent feedbackRequired={false} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  it("should be navigable by keyboard", async () => {
    const { user } = await setup(
      <FeedbackComponent feedbackRequired={false} />,
    );

    const ratingButtons = screen.getAllByRole("button");

    // user tabs through all rating buttons and selects the last one
    await user.tab();
    expect(ratingButtons[0]).toHaveFocus();
    await user.tab();
    expect(ratingButtons[1]).toHaveFocus();
    await user.tab();
    expect(ratingButtons[2]).toHaveFocus();
    await user.tab();
    expect(ratingButtons[3]).toHaveFocus();
    await user.tab();
    expect(ratingButtons[4]).toHaveFocus();
    await user.keyboard("[Space]"); // select 'Excellent' button

    await user.tab();
    expect(screen.getByRole("textbox")).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("link")).toHaveFocus();

    await user.tab();
    expect(screen.getByTestId("continue-button")).toHaveFocus();
    await user.keyboard("[Space]"); // submits

    expect(getInternalFeedbackMetadata).toHaveBeenCalled();
    expect(insertFeedbackMutation).toHaveBeenCalledWith({
      feedbackScore: 5,
      feedbackType: "component",
      userComment: "",
    });
  });
});

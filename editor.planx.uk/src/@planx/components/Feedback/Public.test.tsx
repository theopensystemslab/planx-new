import { screen } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import FeedbackComponent from "./Public";

const handleSubmit = vi.fn();
describe("when the Feedback component is rendered", async () => {
  beforeEach(() => {
    // TODO
  });
  it("should not have any accessibility violations", async () => {
    const { container } = setup(
      <FeedbackComponent title="hello" description="world" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  it("should call handleSubmit when the continue button is pressed", async () => {
    const { user } = setup(
      <FeedbackComponent
        title="hello"
        description="world"
        handleSubmit={handleSubmit}
      />,
    );

    await user.click(screen.getByTestId("feedback-button-terrible"));
    await user.click(screen.getByTestId("continue-button"));

    expect(handleSubmit).toHaveBeenCalled();
  });
});

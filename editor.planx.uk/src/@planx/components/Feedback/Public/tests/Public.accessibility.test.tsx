import React from "react";
import { setup } from "testUtils";
import { axe } from "vitest-axe";

import FeedbackComponent from "../Public";

describe("when the Feedback component is rendered", async () => {
  it("should not have any accessibility violations", async () => {
    const { container } = setup(<FeedbackComponent feedbackRequired={false} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// somethhing about recovering state when pressing the back button

// should be navigable by keyboard

import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";

import Calculate from "./Public";

describe("Calculate component", () => {
  it("renders correctly", async () => {
    const handleSubmit = vi.fn();
    await setup(
      <Calculate
        fn="testGroup"
        formula="pickRandom([1,2])"
        formatOutputForAutomations={true}
        defaults={{}}
        samples={{}}
        handleSubmit={handleSubmit}
      />,
    );

    // Calculate should be auto-answered and never shown to user
    expect(handleSubmit).toHaveBeenCalled();
  });
});

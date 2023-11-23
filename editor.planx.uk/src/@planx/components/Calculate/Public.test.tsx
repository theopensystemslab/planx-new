import React from "react";
import { setup } from "testUtils";

import Public from "./Public";

describe("Calculate component", () => {
  it("renders correctly", () => {
    const handleSubmit = jest.fn();
    setup(
      <Public
        output="testGroup"
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

import React from "react";
import { setup } from "testUtils";
import { axe } from "vitest-axe";

import NextStepsComponent from "./Public";

it("should not have any accessibility violations", async () => {
  const { container } = await setup(
    <NextStepsComponent
      title="title"
      description="description"
      steps={[
        { title: "option 1", description: "", url: "" },
        { title: "option 2", description: "", url: "" },
      ]}
    />,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

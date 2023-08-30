import React from "react";
import { axe, setup } from "testUtils";

import NextStepsComponent from "./Public";

it("should not have any accessibility violations", async () => {
  const { container } = setup(
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

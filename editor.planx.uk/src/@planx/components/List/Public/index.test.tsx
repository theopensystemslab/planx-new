import React from "react";
import { axe, setup } from "testUtils";

import ListComponent from "../Editor";

it("should not have any accessibility violations", async () => {
  const { container } = setup(<ListComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

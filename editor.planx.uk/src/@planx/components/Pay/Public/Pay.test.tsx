import React from "react";
import { axe, setup } from "testUtils";

import Pay from "./Pay";

it("renders correctly with <= £0 fee", () => {
  const handleSubmit = jest.fn();

  // if no props.fn, then fee defaults to 0
  setup(<Pay handleSubmit={handleSubmit} />);

  // handleSubmit is still called to set auto = true so Pay isn't seen in card sequence
  expect(handleSubmit).toHaveBeenCalled();
});

it("should not have any accessibility violations", async () => {
  const handleSubmit = jest.fn();
  const { container } = setup(<Pay handleSubmit={handleSubmit} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

import { render } from "@testing-library/react";
import axe from "axe-helper";
import React from "react";

import Pay from "./Pay";

it("renders correctly with <= £0 fee", () => {
  const handleSubmit = jest.fn();

  // if no props.fn, then fee defaults to 0
  render(<Pay handleSubmit={handleSubmit} />);

  // handleSubmit is still called to set auto = true so Pay isn't seen in card sequence
  expect(handleSubmit).toHaveBeenCalled();
});

it("should not have any accessibility violations", async () => {
  const handleSubmit = jest.fn();
  const { container } = render(<Pay handleSubmit={handleSubmit} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

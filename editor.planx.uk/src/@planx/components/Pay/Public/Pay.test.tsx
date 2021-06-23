import { render } from "@testing-library/react";
import React from "react";

import Pay from "./Pay";

it("renders correctly with <= £0 fee", () => {
  const handleSubmit = jest.fn();

  // if no props.fn, then fee defaults to 0
  render(<Pay handleSubmit={handleSubmit} />);

  // handleSubmit is still called to set auto = true so Pay isn't seen in card sequence
  expect(handleSubmit).toHaveBeenCalled();
});

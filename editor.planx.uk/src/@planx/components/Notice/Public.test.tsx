import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-helper";
import React from "react";

import Notice from "./Public";

test("renders correctly", async () => {
  const handleSubmit = jest.fn();

  render(
    <Notice
      title="hello"
      description="world"
      color="red"
      handleSubmit={handleSubmit}
    />
  );

  await userEvent.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalled();
});

it("should not have any accessibility violations", async () => {
  const { container } = render(
    <Notice title="hello" description="world" color="red" />
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

import { screen } from "@testing-library/react";
import React from "react";
import { axe, setup } from "testUtils";

import Notice from "./Public";

test("renders correctly", async () => {
  const handleSubmit = jest.fn();

  const { user } = setup(
    <Notice
      title="hello"
      description="world"
      color="red"
      handleSubmit={handleSubmit}
    />,
  );

  await user.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalled();
});

it("should not have any accessibility violations", async () => {
  const { container } = setup(
    <Notice title="hello" description="world" color="red" />,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

import { screen } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import Notice from "./Public";

test("renders correctly", async () => {
  const handleSubmit = vi.fn();

  const { user } = await setup(
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
  const { container } = await setup(
    <Notice title="hello" description="world" color="red" />,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

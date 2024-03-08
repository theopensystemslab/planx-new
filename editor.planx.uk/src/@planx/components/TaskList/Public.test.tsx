import { screen } from "@testing-library/react";
import React from "react";
import { axe, setup } from "testUtils";

import TaskList from "./Public";

test("renders correctly", async () => {
  const handleSubmit = jest.fn();

  const { user } = setup(
    <TaskList
      title="to do"
      tasks={[
        { title: "buy land", description: "" },
        { title: "build house", description: "" },
      ]}
      handleSubmit={handleSubmit}
    />,
  );
  await user.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalledTimes(1);
});

it("should not have any accessibility violations", async () => {
  const { container } = setup(
    <TaskList
      title="to do"
      tasks={[
        { title: "buy land", description: "" },
        { title: "build house", description: "" },
      ]}
    />,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

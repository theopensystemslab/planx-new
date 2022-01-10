import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-helper";
import React from "react";

import TaskList from "./Public";

test("renders correctly", async () => {
  const handleSubmit = jest.fn();

  render(
    <TaskList
      tasks={[
        { title: "buy land", description: "" },
        { title: "build house", description: "" },
      ]}
      handleSubmit={handleSubmit}
    />
  );

  userEvent.click(screen.getByText("Continue"));

  expect(handleSubmit).toHaveBeenCalled();
});

it("should not have any accessibility violations", async () => {
  const { container } = render(
    <TaskList
      tasks={[
        { title: "buy land", description: "" },
        { title: "build house", description: "" },
      ]}
    />
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

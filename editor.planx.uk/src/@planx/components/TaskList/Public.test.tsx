import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { axe } from "testUtils";

import TaskList from "./Public";

test("renders correctly", async () => {
  const handleSubmit = jest.fn();
  const user = userEvent.setup();

  render(
    <TaskList
      tasks={[
        { title: "buy land", description: "" },
        { title: "build house", description: "" },
      ]}
      handleSubmit={handleSubmit}
    />
  );
  await user.click(screen.getByTestId("continue-button"));

  await waitFor(() => {
    expect(handleSubmit).toHaveBeenCalled();
  });
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

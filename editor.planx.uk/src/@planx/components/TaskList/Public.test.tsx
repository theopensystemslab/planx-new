import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

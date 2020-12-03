import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  userEvent.click(screen.getByText("Continue"));

  expect(handleSubmit).toHaveBeenCalled();
});

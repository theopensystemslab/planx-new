import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import Content from "./Public";

test("renders correctly", async () => {
  const handleSubmit = jest.fn();

  render(<Content content="hello" handleSubmit={handleSubmit} />);

  expect(screen.getByRole("description")).toHaveTextContent("hello");

  userEvent.click(screen.getByText("Continue"));

  expect(handleSubmit).toHaveBeenCalled();
});

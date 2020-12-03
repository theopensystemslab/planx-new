import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import Content from "./Public";

const content = () => screen.getByTestId("content");

test("renders correctly", async () => {
  const handleSubmit = jest.fn();

  render(<Content content="hello" color="#fff" handleSubmit={handleSubmit} />);

  expect(content()).toHaveTextContent("hello");
  expect(content()).toHaveStyle({
    background: "#fff",
    color: "#000",
  });

  userEvent.click(screen.getByText("Continue"));

  expect(handleSubmit).toHaveBeenCalled();
});

// TODO: this should probably be handled by a global visual test
test("use light text color if color param is dark", () => {
  render(<Content content="dark" color="#000" />);
  expect(content()).toHaveStyle({
    background: "#000",
    color: "#fff",
  });
});

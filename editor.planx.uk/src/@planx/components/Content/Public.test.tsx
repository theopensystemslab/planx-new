import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-helper";
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

  await userEvent.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalled();
});

test("use light text color if color param is dark", () => {
  render(<Content content="dark" color="#000" />);
  expect(content()).toHaveStyle({
    background: "#000",
    color: "#fff",
  });
});

it("should not have any accessibility violations", async () => {
  const { container } = render(<Content content="dark" color="#000" />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

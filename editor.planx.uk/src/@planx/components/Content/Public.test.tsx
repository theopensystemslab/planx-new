import { screen } from "@testing-library/react";
import React from "react";
import { axe, setup } from "testUtils";

import Content from "./Public";

const content = () => screen.getByTestId("content");

test("const { user } = setups correctly", async () => {
  const handleSubmit = jest.fn();

  const { user } = setup(
    <Content content="hello" color="#fff" handleSubmit={handleSubmit} />,
  );

  expect(content()).toHaveTextContent("hello");
  expect(content()).toHaveStyle({
    background: "#fff",
    color: "#0B0C0C",
  });

  await user.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalled();
});

test("use light text color if color param is dark", () => {
  setup(<Content content="dark" color="#000" />);
  expect(content()).toHaveStyle({
    background: "#000",
    color: "#fff",
  });
});

it("should not have any accessibility violations", async () => {
  const { container } = setup(<Content content="dark" color="#000" />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

import { screen } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import Content from "./Public";

const content = () => screen.getByTestId("content");

test("const { user } = setups correctly", async () => {
  const handleSubmit = vi.fn();

  const { user } = await setup(
    <Content content="hello" color="#fff" handleSubmit={handleSubmit} />,
  );

  expect(content()).toHaveTextContent("hello");
  expect(content()).toHaveStyle({
    background: "#fff",
    color: "#0B0C0C",
  });
  expect(screen.queryByTestId("more-info-button")).not.toBeInTheDocument();

  await user.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalled();
});

test("use light text color if color param is dark", async () => {
  await setup(<Content content="dark" color="#000" />);
  expect(content()).toHaveStyle({
    background: "#000",
    color: "#fff",
  });
});

it("should not have any accessibility violations", async () => {
  const { container } = await setup(<Content content="dark" color="#000" />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("should display and open more information link if help text is provided", async () => {
  const handleSubmit = vi.fn();

  const { user } = await setup(
    <Content
      content="This is a warning about doors"
      handleSubmit={handleSubmit}
      info="The number of doors impact your project fee."
    />,
  );

  expect(screen.getByTestId("more-info-button")).toBeInTheDocument();

  await user.click(screen.getByTestId("more-info-button"));
  expect(screen.getByText("Why does it matter?")).toBeInTheDocument();
});

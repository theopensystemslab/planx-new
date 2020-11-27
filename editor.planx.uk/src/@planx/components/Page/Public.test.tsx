import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import Page from "./Public";

test("renders correctly", async () => {
  const handleSubmit = jest.fn();

  render(
    <Page
      title="my page"
      description="interesting description"
      handleSubmit={handleSubmit}
    />
  );

  expect(screen.getByRole("heading")).toHaveTextContent("my page");
  expect(screen.getByRole("description")).toHaveTextContent(
    "interesting description"
  );

  userEvent.click(screen.getByText("Continue"));

  expect(handleSubmit).toHaveBeenCalled();
});

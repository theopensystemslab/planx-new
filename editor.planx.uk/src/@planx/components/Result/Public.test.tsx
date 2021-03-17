import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import Result from "./Public";

test("renders correctly", async () => {
  const handleSubmit = jest.fn();

  render(
    <Result
      headingColor={{ text: "#000", background: "#fff" }}
      responses={[]}
      handleSubmit={handleSubmit}
      headingTitle="AMAZING"
    />
  );

  expect(screen.getAllByRole("heading")[0]).toHaveTextContent("AMAZING");

  await act(async () => {
    await userEvent.click(screen.getByText("Continue"));
  });
  expect(handleSubmit).toHaveBeenCalled();
});

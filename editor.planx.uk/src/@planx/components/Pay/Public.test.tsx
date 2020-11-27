import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import Pay from "./Public";

const waitForThenClick = async (text: string) => {
  userEvent.click(await waitFor(async () => screen.getByText(text)));
};

test("apple pay", async () => {
  const handleSubmit = jest.fn();

  render(<Pay handleSubmit={handleSubmit} />);

  await waitForThenClick("Apple Pay");
  await waitForThenClick("Continue");
  await waitForThenClick("Pay & submit");
  await waitForThenClick("Continue");

  expect(handleSubmit).toHaveBeenCalled();
});

test("credit card", async () => {
  const handleSubmit = jest.fn();

  render(<Pay handleSubmit={handleSubmit} />);

  await waitForThenClick("Credit or debit card");
  await waitForThenClick("Continue");
  await waitForThenClick("Pay & submit");
  await waitForThenClick("Continue");

  expect(handleSubmit).toHaveBeenCalled();
});

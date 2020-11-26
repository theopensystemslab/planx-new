import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import Pay from "./Public";

test("apple pay", async () => {
  const handleSubmit = jest.fn();

  render(<Pay handleSubmit={handleSubmit} />);

  await waitFor(async () => {
    userEvent.click(screen.getByText("Apple Pay"));
  });

  await waitFor(async () => {
    userEvent.click(screen.getByText("Continue"));
  });

  await waitFor(async () => {
    userEvent.click(screen.getByText("Pay & submit"));
  });

  await waitFor(async () => {
    userEvent.click(screen.getByText("Continue"));
  });

  expect(handleSubmit).toHaveBeenCalled();
});

test("credit card", async () => {
  const handleSubmit = jest.fn();

  render(<Pay handleSubmit={handleSubmit} />);

  await waitFor(async () => {
    userEvent.click(screen.getByText("Credit or debit card"));
  });

  await waitFor(async () => {
    userEvent.click(screen.getByText("Continue"));
  });

  await waitFor(async () => {
    userEvent.click(screen.getByText("Pay & submit"));
  });

  await waitFor(async () => {
    userEvent.click(screen.getByText("Continue"));
  });

  expect(handleSubmit).toHaveBeenCalled();
});

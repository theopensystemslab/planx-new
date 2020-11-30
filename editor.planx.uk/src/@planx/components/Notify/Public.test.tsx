import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import React from "react";

import Notify from "./Public";

jest.mock("axios");

test("renders correctly", async () => {
  const handleSubmit = jest.fn();

  render(<Notify url="http://example.com" handleSubmit={handleSubmit} />);

  const spy = jest.spyOn(axios, "post");

  (axios.post as any).mockImplementationOnce(() => Promise.resolve({}));

  userEvent.click(screen.getByText("Continue"));

  // Why is Promise.resolve here? https://stackoverflow.com/a/54897128
  await Promise.resolve();

  expect(spy).toHaveBeenCalledWith("http://example.com", { hello: "world" });

  expect(handleSubmit).toHaveBeenCalled();
});

test("does not proceed if request fails", async () => {
  const handleSubmit = jest.fn();
  window.alert = jest.fn();
  console.error = jest.fn(); // hide error from logs

  render(<Notify url="http://example.com" handleSubmit={handleSubmit} />);

  (axios.post as any).mockImplementationOnce(() => Promise.reject());

  userEvent.click(screen.getByText("Continue"));

  // Why is Promise.resolve here? https://stackoverflow.com/a/54897128
  await Promise.resolve();

  expect(window.alert).toHaveBeenCalledWith("There was an error");

  expect(handleSubmit).not.toHaveBeenCalled();
});

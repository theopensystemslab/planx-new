import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import React from "react";

import Send from "./Public";

jest.mock("axios");

test("renders correctly", async () => {
  const handleSubmit = jest.fn();
  const data = { hello: "world" };

  render(<Send url="http://example.com" handleSubmit={handleSubmit} />);

  (axios.get as any).mockImplementationOnce(() => Promise.resolve({ data }));
  (axios.post as any).mockImplementationOnce(() => Promise.resolve({}));

  const spy = jest.spyOn(axios, "post");

  userEvent.click(screen.getByText("Continue"));

  // Why is Promise.resolve here? https://stackoverflow.com/a/54897128
  await Promise.resolve();
  await Promise.resolve();

  expect(spy).toHaveBeenCalledWith("http://example.com", data);

  expect(handleSubmit).toHaveBeenCalled();
});

test("does not proceed if request fails", async () => {
  const handleSubmit = jest.fn();
  window.alert = jest.fn();
  console.error = jest.fn(); // hide error from logs

  render(<Send url="http://example.com" handleSubmit={handleSubmit} />);

  (axios.post as any).mockImplementationOnce(() => Promise.reject());

  userEvent.click(screen.getByText("Continue"));

  // Why is Promise.resolve here? https://stackoverflow.com/a/54897128
  await Promise.resolve();

  expect(window.alert).toHaveBeenCalledWith("There was an error");

  expect(handleSubmit).not.toHaveBeenCalled();
});

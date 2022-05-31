import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import React from "react";

import { TYPES } from "../types";
import ExternalPortalForm from "./Editor";

const mock = new MockAdapter(axios);
beforeAll(() => {
  mock.onGet(/(.*)\/has-review/).reply(200, { hasReview: false });
});

afterAll(() => {
  mock.restore();
});

test("adding an external portal", async () => {
  const handleSubmit = jest.fn();
  render(
    <ExternalPortalForm
      flows={[
        { id: "a", text: "flow a" },
        { id: "b", text: "flow b" },
      ]}
      handleSubmit={handleSubmit}
    />
  );

  expect(screen.getByTestId("flowId")).toHaveValue("");

  act(() => {
    fireEvent.change(screen.getByTestId("flowId"), { target: { value: "b" } });
  });

  await waitFor(() => {
    fireEvent.submit(screen.getByTestId("form"));
  });

  expect(handleSubmit).toHaveBeenCalledWith({
    type: TYPES.ExternalPortal,
    data: {
      flowId: "b",
    },
  });
});

test("changing an external portal", async () => {
  const handleSubmit = jest.fn();

  render(
    <ExternalPortalForm
      id="test"
      flowId="b"
      flows={[
        { id: "a", text: "flow a" },
        { id: "b", text: "flow b" },
      ]}
      handleSubmit={handleSubmit}
    />
  );

  expect(screen.getByTestId("flowId")).toHaveValue("b");

  act(() => {
    fireEvent.change(screen.getByTestId("flowId"), { target: { value: "a" } });
  });

  await waitFor(() => {
    fireEvent.submit(screen.getByTestId("form"));
  });

  expect(handleSubmit).toHaveBeenCalledWith({
    type: TYPES.ExternalPortal,
    data: {
      flowId: "a",
    },
  });
});

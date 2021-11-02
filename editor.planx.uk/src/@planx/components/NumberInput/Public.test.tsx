import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { uniqueId } from "lodash";
import React from "react";
import { act } from "react-dom/test-utils";

import NumberInput from "./Public";

test("renders correctly", async () => {
  const handleSubmit = jest.fn();

  render(
    <NumberInput fn="num" title="Numberwang!" handleSubmit={handleSubmit} />
  );

  expect(screen.getByRole("heading")).toHaveTextContent("Numberwang!");

  await act(async () => {
    await userEvent.click(screen.getByText("Continue"));
  });

  expect(handleSubmit).toHaveBeenCalledTimes(0);

  await act(async () => {
    await userEvent.type(screen.getByPlaceholderText("enter value"), "3");
    await userEvent.click(screen.getByText("Continue"));
  });

  expect(handleSubmit).toHaveBeenCalledWith({ data: { num: 3 } });
});

test("recovers previously submitted number when clicking the back button", async () => {
  const handleSubmit = jest.fn();
  const componentId = uniqueId();

  render(
    <NumberInput
      title="Cached Number"
      handleSubmit={handleSubmit}
      id={componentId}
      previouslySubmittedData={{
        data: {
          [componentId]: 43,
        },
      }}
    />
  );

  await waitFor(async () => {
    userEvent.click(screen.getByText("Continue"));
  });

  expect(handleSubmit).toHaveBeenCalledWith({ data: { [componentId]: 43 } });
});

test("recovers previously submitted number when clicking the back button even if a data field is set", async () => {
  const handleSubmit = jest.fn();
  const componentId = uniqueId();
  const dataField = "data-field";

  render(
    <NumberInput
      fn={dataField}
      title="Cached Number"
      handleSubmit={handleSubmit}
      id={componentId}
      previouslySubmittedData={{
        data: {
          [dataField]: 43,
        },
      }}
    />
  );

  await waitFor(async () => {
    userEvent.click(screen.getByText("Continue"));
  });

  expect(handleSubmit).toHaveBeenCalledWith({ data: { [dataField]: 43 } });
});

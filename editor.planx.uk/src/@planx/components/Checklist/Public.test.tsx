import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import Checklist from "./Public";

test("answers are submitted in order they were supplied", async () => {
  const handleSubmit = jest.fn();

  render(
    <Checklist
      allRequired={false}
      description=""
      text="home type?"
      handleSubmit={handleSubmit}
      options={
        [
          {
            id: "flat_id",
            data: {
              text: "Flat",
            },
          },
          {
            id: "caravan_id",
            data: {
              text: "Caravan",
            },
          },
          {
            id: "house_id",
            data: {
              text: "House",
            },
          },
          {
            id: "spaceship_id",
            data: {
              text: "Spaceship",
            },
          },
        ] as any /* TODO: fix this 'any' type :( */
      }
    />
  );

  expect(screen.getByRole("heading")).toHaveTextContent("home type?");

  userEvent.click(screen.getByText("Spaceship"));
  userEvent.click(screen.getByText("Flat"));
  userEvent.click(screen.getByText("House"));

  waitFor(async () => {
    userEvent.click(screen.getByText("Continue"));
  });

  // order matches the order of the options, not order they were clicked
  expect(handleSubmit).toHaveBeenCalledWith([
    "flat_id",
    "house_id",
    "spaceship_id",
  ]);
});

test.todo("expandable checklist");

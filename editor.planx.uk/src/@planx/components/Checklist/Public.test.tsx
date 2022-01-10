import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-helper";
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
      options={[
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
      ]}
    />
  );

  expect(screen.getByRole("heading")).toHaveTextContent("home type?");

  userEvent.click(screen.getByText("Spaceship"));
  userEvent.click(screen.getByText("Flat"));
  userEvent.click(screen.getByText("House"));

  await waitFor(async () => {
    userEvent.click(screen.getByText("Continue"));
  });

  // order matches the order of the options, not order they were clicked
  expect(handleSubmit).toHaveBeenCalledWith({
    answers: ["flat_id", "house_id", "spaceship_id"],
  });
});

test("submits answers with grouped options", async () => {
  const handleSubmit = jest.fn();

  render(
    <Checklist
      allRequired={false}
      description=""
      text="home type?"
      handleSubmit={handleSubmit}
      groupedOptions={[
        {
          title: "Section 1",
          children: [
            {
              id: "S1_Option1",
              data: {
                text: "S1 Option1",
              },
            },
            {
              id: "S1_Option2",
              data: {
                text: "S1 Option2",
              },
            },
          ],
        },
        {
          title: "Section 2",
          children: [
            {
              id: "S2_Option1",
              data: {
                text: "S2 Option1",
              },
            },
            {
              id: "S2_Option2",
              data: {
                text: "S2 Option2",
              },
            },
          ],
        },
        {
          title: "Section 3",
          children: [
            {
              id: "S3_Option1",
              data: {
                text: "S3 Option1",
              },
            },
            {
              id: "S3_Option2",
              data: {
                text: "S3 Option2",
              },
            },
          ],
        },
      ]}
    />
  );

  await act(async () => {
    userEvent.click(screen.getByText("Section 1"));
  });

  userEvent.click(screen.getByText("S1 Option1"));

  await act(async () => {
    userEvent.click(screen.getByText("Section 2"));
  });

  userEvent.click(screen.getByText("S2 Option2"));

  await waitFor(async () => {
    userEvent.click(screen.getByText("Continue"));
  });

  expect(handleSubmit).toHaveBeenCalledWith({
    answers: ["S1_Option1", "S2_Option2"],
  });
});

test("recovers checkboxes state when clicking the back button", async () => {
  const handleSubmit = jest.fn();

  render(
    <Checklist
      allRequired={false}
      description=""
      text="home type?"
      handleSubmit={handleSubmit}
      previouslySubmittedData={{ answers: ["flat_id", "house_id"] }}
      options={[
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
      ]}
    />
  );

  await waitFor(async () => {
    userEvent.click(screen.getByText("Continue"));
  });

  expect(handleSubmit).toHaveBeenCalledWith({
    answers: ["flat_id", "house_id"],
  });
});

test("recovers grouped options state when clicking the back button", async () => {
  const handleSubmit = jest.fn();

  render(
    <Checklist
      allRequired={false}
      description=""
      text="home type?"
      handleSubmit={handleSubmit}
      previouslySubmittedData={{ answers: ["S1_Option1", "S3_Option1"] }}
      groupedOptions={[
        {
          title: "Section 1",
          children: [
            {
              id: "S1_Option1",
              data: {
                text: "S1 Option1",
              },
            },
            {
              id: "S1_Option2",
              data: {
                text: "S1 Option2",
              },
            },
          ],
        },
        {
          title: "Section 2",
          children: [
            {
              id: "S2_Option1",
              data: {
                text: "S2 Option1",
              },
            },
            {
              id: "S2_Option2",
              data: {
                text: "S2 Option2",
              },
            },
          ],
        },
        {
          title: "Section 3",
          children: [
            {
              id: "S3_Option1",
              data: {
                text: "S3 Option1",
              },
            },
            {
              id: "S3_Option2",
              data: {
                text: "S3 Option2",
              },
            },
          ],
        },
      ]}
    />
  );

  expect(screen.getByTestId("group-0-expanded")).toBeTruthy();
  expect(screen.queryAllByTestId("group-1-expanded")).toHaveLength(0);
  expect(screen.getByTestId("group-2-expanded")).toBeTruthy();

  await waitFor(async () => {
    userEvent.click(screen.getByText("Continue"));
  });

  expect(handleSubmit).toHaveBeenCalledWith({
    answers: ["S1_Option1", "S3_Option1"],
  });
});

it("should not have any accessibility violations", async () => {
  const { container } = render(
    <Checklist
      allRequired={false}
      description=""
      text="home type?"
      options={[
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
      ]}
    />
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

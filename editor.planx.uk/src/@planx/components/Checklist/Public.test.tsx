import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-helper";
import React from "react";

import { Option } from "../shared";
import { Group } from "./model";
import Checklist, { ChecklistLayout } from "./Public";

const options: {
  [key in ChecklistLayout]?: Array<Option>;
} = {
  [ChecklistLayout.Basic]: [
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
  ],
  [ChecklistLayout.Images]: [
    {
      id: "flat_id",
      data: {
        text: "Flat",
        img: "flat.jpg",
      },
    },
    {
      id: "caravan_id",
      data: {
        text: "Caravan",
        img: "caravan.jpg",
      },
    },
    {
      id: "house_id",
      data: {
        text: "House",
        img: "house.jpg",
      },
    },
    {
      id: "spaceship_id",
      data: {
        text: "Spaceship",
        img: "spaceship.jpg",
      },
    },
  ],
};

const groupedOptions: Array<Group<Option>> = [
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
];

describe("Checklist Component - Grouped Layout", () => {
  it("answers are submitted in order they were supplied", async () => {
    const handleSubmit = jest.fn();

    render(
      <Checklist
        allRequired={false}
        description=""
        text="home type?"
        handleSubmit={handleSubmit}
        groupedOptions={groupedOptions}
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
      userEvent.click(screen.getByTestId("continue-button"));
    });

    expect(handleSubmit).toHaveBeenCalledWith({
      answers: ["S1_Option1", "S2_Option2"],
    });
  });
  it("recovers checkboxes state when clicking the back button", async () => {
    const handleSubmit = jest.fn();

    render(
      <Checklist
        allRequired={false}
        description=""
        text="home type?"
        handleSubmit={handleSubmit}
        previouslySubmittedData={{ answers: ["S1_Option1", "S3_Option1"] }}
        groupedOptions={groupedOptions}
      />
    );

    expect(screen.getByTestId("group-0-expanded")).toBeTruthy();
    expect(screen.queryAllByTestId("group-1-expanded")).toHaveLength(0);
    expect(screen.getByTestId("group-2-expanded")).toBeTruthy();

    await waitFor(async () => {
      userEvent.click(screen.getByTestId("continue-button"));
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
        groupedOptions={groupedOptions}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  it("should be navigable by keyboard", async () => {
    const handleSubmit = jest.fn();

    const { container } = render(
      <Checklist
        allRequired={false}
        description=""
        text="home type?"
        handleSubmit={handleSubmit}
        groupedOptions={groupedOptions}
      />
    );
    const section1Button = screen.getByText("Section 1").parentNode;
    const section2Button = screen.getByText("Section 2").parentNode;
    const section3Button = screen.getByText("Section 3").parentNode;

    // All accordion sections begin collapsed
    [section1Button, section2Button, section3Button].forEach((element) => {
      expect(element).toHaveAttribute("aria-expanded", "false");
    });
    // Tab gives focus to first section
    userEvent.tab();
    expect(section1Button).toHaveFocus();
    // Tab jumps to second section
    userEvent.tab();
    expect(section2Button).toHaveFocus();
    // Space opens second section
    userEvent.keyboard("[Space]");
    expect(section2Button).toHaveAttribute("aria-expanded", "true");
    // Tab goes to Section 2, Option 1
    userEvent.tab();
    expect(container.querySelector("#S2_Option1")).toHaveFocus();
    // Select option using keyboard
    userEvent.keyboard("[Space]");
    expect(container.querySelector("#S2_Option1")).toBeChecked();
    // Tab to Section 2, Option 2
    userEvent.tab();
    expect(container.querySelector("#S2_Option2")).toHaveFocus();
    // Select option using keyboard
    userEvent.keyboard("[Space]");
    expect(container.querySelector("#S2_Option2")).toBeChecked();
    // Tab to Section 3, and navigate through to "Continue" without selecting anything
    userEvent.tab();
    expect(section3Button).toHaveFocus();
    userEvent.keyboard("[Space]");
    expect(section3Button).toHaveAttribute("aria-expanded", "true");
    userEvent.tab();
    userEvent.tab();
    userEvent.tab();
    expect(screen.getByTestId("continue-button")).toHaveFocus();
    // Submit
    await waitFor(async () => {
      userEvent.keyboard("[Space]");
    });
    expect(handleSubmit).toHaveBeenCalledWith({
      answers: ["S2_Option1", "S2_Option2"],
    });
  });
});

describe("Checklist Component - Basic & Images Layout", () => {
  [ChecklistLayout.Basic, ChecklistLayout.Images].forEach((type) => {
    it(`answers are submitted in order they were supplied (${ChecklistLayout[type]} layout)`, async () => {
      const handleSubmit = jest.fn();

      render(
        <Checklist
          allRequired={false}
          description=""
          text="home type?"
          handleSubmit={handleSubmit}
          options={options[type]}
        />
      );

      expect(screen.getByRole("heading")).toHaveTextContent("home type?");

      userEvent.click(screen.getByText("Spaceship"));
      userEvent.click(screen.getByText("Flat"));
      userEvent.click(screen.getByText("House"));

      await waitFor(async () => {
        userEvent.click(screen.getByTestId("continue-button"));
      });

      // order matches the order of the options, not order they were clicked
      expect(handleSubmit).toHaveBeenCalledWith({
        answers: ["flat_id", "house_id", "spaceship_id"],
      });
    });
    it(`recovers checkboxes state when clicking the back button (${ChecklistLayout[type]} layout)`, async () => {
      const handleSubmit = jest.fn();

      render(
        <Checklist
          allRequired={false}
          description=""
          text="home type?"
          handleSubmit={handleSubmit}
          previouslySubmittedData={{ answers: ["flat_id", "house_id"] }}
          options={options[type]}
        />
      );

      await waitFor(async () => {
        userEvent.click(screen.getByTestId("continue-button"));
      });

      expect(handleSubmit).toHaveBeenCalledWith({
        answers: ["flat_id", "house_id"],
      });
    });
    it(`should not have any accessibility violations (${ChecklistLayout[type]} layout)`, async () => {
      const { container } = render(
        <Checklist
          allRequired={false}
          description=""
          text="home type?"
          options={options[type]}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
    test(`Focus jumps from checkbox to checkbox (${ChecklistLayout[type]} layout)`, () => {
      const handleSubmit = jest.fn();

      const { container } = render(
        <Checklist
          allRequired={false}
          description=""
          text="home type?"
          handleSubmit={handleSubmit}
          options={options[type]}
        />
      );

      userEvent.tab();
      expect(container.querySelector("#flat_id")).toHaveFocus();
      userEvent.tab();
      expect(container.querySelector("#caravan_id")).toHaveFocus();
    });
  });
});

import { screen } from "@testing-library/react";
// eslint-disable-next-line no-restricted-imports
import userEvent, {
  PointerEventsCheckLevel,
} from "@testing-library/user-event";
import React from "react";
import { axe, setup } from "testUtils";

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

    const { user } = setup(
      <Checklist
        allRequired={false}
        description=""
        text="home type?"
        handleSubmit={handleSubmit}
        groupedOptions={groupedOptions}
      />,
    );

    await user.click(screen.getByText("Section 1"));
    await user.click(screen.getByText("S1 Option1"));
    await user.click(screen.getByText("Section 2"));
    await user.click(screen.getByText("S2 Option2"));
    await user.click(screen.getByTestId("continue-button"));

    expect(handleSubmit).toHaveBeenCalledWith({
      answers: ["S1_Option1", "S2_Option2"],
    });
  });
  it("recovers checkboxes state when clicking the back button", async () => {
    const handleSubmit = jest.fn();

    const { user } = setup(
      <Checklist
        allRequired={false}
        description=""
        text="home type?"
        handleSubmit={handleSubmit}
        previouslySubmittedData={{ answers: ["S1_Option1", "S3_Option1"] }}
        groupedOptions={groupedOptions}
      />,
    );

    expect(screen.getByTestId("group-0-expanded")).toBeTruthy();
    expect(screen.queryAllByTestId("group-1-expanded")).toHaveLength(0);
    expect(screen.getByTestId("group-2-expanded")).toBeTruthy();

    await user.click(screen.getByTestId("continue-button"));

    expect(handleSubmit).toHaveBeenCalledWith({
      answers: ["S1_Option1", "S3_Option1"],
    });
  });
  it("should not have any accessibility violations", async () => {
    const { container } = setup(
      <Checklist
        allRequired={false}
        description=""
        text="home type?"
        groupedOptions={groupedOptions}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  it("should be navigable by keyboard", async () => {
    const handleSubmit = jest.fn();

    const { user } = setup(
      <Checklist
        allRequired={false}
        description=""
        text="home type?"
        handleSubmit={handleSubmit}
        groupedOptions={groupedOptions}
      />,
    );
    const [section1Button, section2Button, section3Button, _continueButton] =
      screen.getAllByRole("button");

    // All accordion sections begin collapsed
    [section1Button, section2Button, section3Button].forEach((element) => {
      expect(element).toHaveAttribute("aria-expanded", "false");
    });
    // Tab gives focus to first section
    await user.tab();
    expect(section1Button).toHaveFocus();
    // Tab jumps to second section
    await user.tab();
    expect(section2Button).toHaveFocus();
    // Space opens second section
    await user.keyboard("[Space]");
    expect(section2Button).toHaveAttribute("aria-expanded", "true");
    // Tab goes to Section 2, Option 1
    await user.tab();
    expect(screen.getByTestId("S2_Option1")).toHaveFocus();
    // Select option using keyboard
    await user.keyboard("[Space]");
    expect(screen.getByTestId("S2_Option1")).toBeChecked();
    // Tab to Section 2, Option 2
    await user.tab();
    expect(screen.getByTestId("S2_Option2")).toHaveFocus();
    // Select option using keyboard
    await user.keyboard("[Space]");
    expect(screen.getByTestId("S2_Option2")).toBeChecked();
    // Tab to Section 3, and navigate through to "Continue" without selecting anything
    await user.tab();
    expect(section3Button).toHaveFocus();
    await user.keyboard("[Space]");
    expect(section3Button).toHaveAttribute("aria-expanded", "true");
    await user.tab();
    await user.tab();
    await user.tab();
    expect(screen.getByTestId("continue-button")).toHaveFocus();
    // Submit
    await user.keyboard("[Space]");
    expect(handleSubmit).toHaveBeenCalledWith({
      answers: ["S2_Option1", "S2_Option2"],
    });
  });
});

describe("Checklist Component - Basic & Images Layout", () => {
  [ChecklistLayout.Basic, ChecklistLayout.Images].forEach((type) => {
    it(`answers are submitted in order they were supplied (${ChecklistLayout[type]} layout)`, async () => {
      const handleSubmit = jest.fn();

      setup(
        <Checklist
          allRequired={false}
          description=""
          text="home type?"
          handleSubmit={handleSubmit}
          options={options[type]}
        />,
      );

      expect(screen.getByRole("heading")).toHaveTextContent("home type?");

      // Disabling pointerEventsCheck here allows us to bypass a false negative thrown by react-testing-library
      // Tests fail to click the text elements when using ChecklistLayout.Images due to the pointerEvents: "none" style applied to textLabelWrapper, but the element can be clicked in all tested browsers
      await userEvent.click(screen.getByText("Spaceship"), {
        pointerEventsCheck: PointerEventsCheckLevel.Never,
      });
      await userEvent.click(screen.getByText("Flat"), {
        pointerEventsCheck: PointerEventsCheckLevel.Never,
      });
      await userEvent.click(screen.getByText("House"), {
        pointerEventsCheck: PointerEventsCheckLevel.Never,
      });
      await userEvent.click(screen.getByTestId("continue-button"), {
        pointerEventsCheck: PointerEventsCheckLevel.Never,
      });

      // order matches the order of the options, not order they were clicked
      expect(handleSubmit).toHaveBeenCalledWith({
        answers: ["flat_id", "house_id", "spaceship_id"],
      });
    });
    it(`recovers checkboxes state when clicking the back button (${ChecklistLayout[type]} layout)`, async () => {
      const handleSubmit = jest.fn();

      const { user } = setup(
        <Checklist
          allRequired={false}
          description=""
          text="home type?"
          handleSubmit={handleSubmit}
          previouslySubmittedData={{ answers: ["flat_id", "house_id"] }}
          options={options[type]}
        />,
      );

      await user.click(screen.getByTestId("continue-button"));

      expect(handleSubmit).toHaveBeenCalledWith({
        answers: ["flat_id", "house_id"],
      });
    });
    it(`should not have any accessibility violations (${ChecklistLayout[type]} layout)`, async () => {
      const { container } = setup(
        <Checklist
          allRequired={false}
          description=""
          text="home type?"
          options={options[type]}
        />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
    test(`Focus jumps from checkbox to checkbox (${ChecklistLayout[type]} layout)`, async () => {
      const handleSubmit = jest.fn();

      const { user } = setup(
        <Checklist
          allRequired={false}
          description=""
          text="home type?"
          handleSubmit={handleSubmit}
          options={options[type]}
        />,
      );

      await user.tab();
      expect(screen.getByTestId("flat_id")).toHaveFocus();
      await user.tab();
      expect(screen.getByTestId("caravan_id")).toHaveFocus();
    });
  });
});

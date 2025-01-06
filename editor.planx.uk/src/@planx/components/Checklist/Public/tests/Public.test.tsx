import { screen } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import { ChecklistLayout } from "../../model";
import Checklist from "../Public";
import { groupedOptions, options } from "./mockOptions";
import { pressContinue, pressOption } from "./testUtils";

describe("Checklist Component - Grouped Layout", () => {
  it("answers are submitted in order they were supplied", async () => {
    const handleSubmit = vi.fn();

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
    const handleSubmit = vi.fn();

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
    const handleSubmit = vi.fn();

    const { user } = setup(
      <Checklist
        allRequired={false}
        description=""
        text="home type?"
        handleSubmit={handleSubmit}
        groupedOptions={groupedOptions}
      />,
    );
    const [section1Button, section2Button, section3Button] =
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
    // Tab to Section 2, Option 2
    await user.tab();
    expect(screen.getByTestId("S2_Option2")).toHaveFocus();
    // Select option using keyboard
    await user.keyboard("[Space]");
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
      const handleSubmit = vi.fn();

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

      await pressOption("Spaceship");
      await pressOption("Flat");
      await pressOption("House");

      await pressContinue();

      // order matches the order of the options, not order they were clicked
      expect(handleSubmit).toHaveBeenCalledWith({
        answers: ["flat_id", "house_id", "spaceship_id"],
      });
    });

    it(`recovers checkboxes state when clicking the back button (${ChecklistLayout[type]} layout)`, async () => {
      const handleSubmit = vi.fn();

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
      const handleSubmit = vi.fn();

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

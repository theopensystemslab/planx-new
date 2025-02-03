import { screen } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import Checklist from "../Public";
import {
  groupedOptions,
  groupedOptionsWithExclusiveOption,
} from "./mockOptions";

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

  it("handles exclusive Or options correctly", async () => {
    const handleSubmit = vi.fn();

    const { user } = setup(
      <Checklist
        allRequired={false}
        description=""
        text="home type?"
        handleSubmit={handleSubmit}
        groupedOptions={groupedOptionsWithExclusiveOption}
      />,
    );

    // user presses an option in section 1
    await user.click(screen.getByText("Section 1"));

    const nonExclusiveOption = screen.getByLabelText("S1 Option1");
    await user.click(nonExclusiveOption);
    expect(nonExclusiveOption).toHaveAttribute("checked");

    const exclusiveOption = screen.getByLabelText("Exclusive");
    await user.click(exclusiveOption);

    expect(nonExclusiveOption).not.toHaveAttribute("checked");
    expect(exclusiveOption).toHaveAttribute("checked");

    await user.click(screen.getByText("Section 2"));
    const exclusiveOptionInSection2 = screen.getByLabelText("S2 Option1");
    await user.click(exclusiveOptionInSection2);

    expect(exclusiveOptionInSection2).toHaveAttribute("checked");
    expect(exclusiveOption).not.toHaveAttribute("checked");

    // user presses two more non-exclusive options
    await user.click(screen.getByText("S1 Option1"));
    await user.click(screen.getByText("S2 Option2"));

    await user.click(screen.getByTestId("continue-button"));

    expect(handleSubmit).toHaveBeenCalledWith({
      answers: ["S1_Option1", "S2_Option1", "S2_Option2"],
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

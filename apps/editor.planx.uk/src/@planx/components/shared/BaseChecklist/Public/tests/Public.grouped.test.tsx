import { screen } from "@testing-library/react";
import { cloneDeep } from "lodash";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import Checklist from "../../../../Checklist/Public";
import {
  groupedOptions,
  groupedOptionsWithExclusiveOption,
  mockWithRepeatedOptions,
} from "./mockOptions";

describe("Checklist Component - Grouped Layout", () => {
  it("answers are submitted in order they were supplied", async () => {
    const handleSubmit = vi.fn();

    const { user } = await setup(
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

  it("displays descriptions when provided", async () => {
    const handleSubmit = vi.fn();

    const { user } = await setup(
      <Checklist
        allRequired={false}
        description=""
        text="home type?"
        handleSubmit={handleSubmit}
        groupedOptions={groupedOptions}
      />,
    );

    await user.click(screen.getByText("Section 1"));
    expect(screen.getByText("S1 Option2")).toBeVisible();
    expect(screen.getByText("S1 Option2 has a description")).toBeVisible();

    await user.click(screen.getByText("S1 Option2"));
    await user.click(screen.getByTestId("continue-button"));

    expect(handleSubmit).toHaveBeenCalledWith({
      answers: ["S1_Option2"],
    });
  });

  it("recovers checkboxes state when clicking the back button", async () => {
    const handleSubmit = vi.fn();

    const { user } = await setup(
      <Checklist
        allRequired={false}
        description=""
        text="home type?"
        handleSubmit={handleSubmit}
        previouslySubmittedData={{ answers: ["S1_Option1", "S3_Option1"] }}
        groupedOptions={groupedOptions}
      />,
    );

    expect(screen.getByTestId("group-0-expanded")).toBeInTheDocument();
    expect(screen.queryAllByTestId("group-1-expanded")).toHaveLength(0);
    expect(screen.getByTestId("group-2-expanded")).toBeInTheDocument();

    await user.click(screen.getByTestId("continue-button"));

    expect(handleSubmit).toHaveBeenCalledWith({
      answers: ["S1_Option1", "S3_Option1"],
    });
  });

  it("handles exclusive Or options correctly", async () => {
    const handleSubmit = vi.fn();

    const { user } = await setup(
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
    expect(nonExclusiveOption).toBeChecked();

    const exclusiveOption = screen.getByLabelText("Exclusive");
    await user.click(exclusiveOption);

    expect(nonExclusiveOption).not.toBeChecked();
    expect(exclusiveOption).toBeChecked();

    await user.click(screen.getByText("Section 2"));
    const exclusiveOptionInSection2 = screen.getByLabelText("S2 Option1");
    await user.click(exclusiveOptionInSection2);

    expect(exclusiveOptionInSection2).toBeChecked();
    expect(exclusiveOption).not.toBeChecked();

    // user presses two more non-exclusive options
    await user.click(screen.getByText("S1 Option1"));
    await user.click(screen.getByText("S2 Option2"));

    await user.click(screen.getByTestId("continue-button"));

    expect(handleSubmit).toHaveBeenCalledWith({
      answers: ["S1_Option1", "S2_Option1", "S2_Option2"],
    });
  });

  it("should not have any accessibility violations", async () => {
    const { container } = await setup(
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

    const { user } = await setup(
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

describe("toggling options by matching data values and labels", () => {
  it("toggles and and off options in another group when both the label and data value match", async () => {
    const { user } = await setup(<Checklist {...mockWithRepeatedOptions} />);

    await user.click(screen.getByText("Common projects for homes"));
    await user.click(screen.getByText("Extensions"));

    const repeatedOptions = screen.getAllByLabelText("Roof extension");

    expect(repeatedOptions).toHaveLength(2);

    const [first, second] = repeatedOptions;

    expect(first).not.toBeChecked();
    expect(second).not.toBeChecked();

    // Toggle on by first
    await user.click(first);
    expect(first).toBeChecked();
    expect(second).toBeChecked();

    // Toggle off by second
    await user.click(first);
    expect(first).not.toBeChecked();
    expect(second).not.toBeChecked();

    // Toggle on by second
    await user.click(second);
    expect(first).toBeChecked();
    expect(second).toBeChecked();

    // Toggle off by first
    await user.click(first);
    expect(first).not.toBeChecked();
    expect(second).not.toBeChecked();
  });

  it("does not toggle on and off options in another group when only the labels match", async () => {
    const mockProps = cloneDeep(mockWithRepeatedOptions);

    mockProps.groupedOptions?.[1].children.push({
      id: "2zIVEYaAza",
      data: {
        val: "unique.data.val",
        // Repeated label
        text: "Rear or side extension (or conservatory)",
      },
    });

    const { user } = await setup(<Checklist {...mockProps} />);

    await user.click(screen.getByText("Common projects for homes"));
    await user.click(screen.getByText("Extensions"));

    const repeatedOptions = screen.getAllByLabelText(
      "Rear or side extension (or conservatory)",
    );

    expect(repeatedOptions).toHaveLength(2);

    const [first, second] = repeatedOptions;

    expect(first).not.toBeChecked();
    expect(second).not.toBeChecked();

    // Toggling on first has no effect on second
    await user.click(first);
    expect(first).toBeChecked();
    expect(second).not.toBeChecked();

    // Toggling on second has no effect on second
    await user.click(second);
    expect(first).toBeChecked();
    expect(second).toBeChecked();

    // Toggling off first has no effect on second
    await user.click(first);
    expect(first).not.toBeChecked();
    expect(second).toBeChecked();

    // Toggling off second has no effect on first
    await user.click(second);
    expect(first).not.toBeChecked();
    expect(second).not.toBeChecked();
  });

  it("does not toggle on and off options in another group when only the data values match", async () => {
    const mockProps = cloneDeep(mockWithRepeatedOptions);

    mockProps.groupedOptions?.[1].children.push({
      id: "2zIVEYaAza",
      data: {
        text: "Unique label",
        // Repeated data value
        val: "extend.rear",
      },
    });

    const { user } = await setup(<Checklist {...mockProps} />);

    await user.click(screen.getByText("Common projects for homes"));
    await user.click(screen.getByText("Extensions"));

    const first = screen.getByLabelText(
      "Rear or side extension (or conservatory)",
      { exact: true },
    );
    const second = screen.getByLabelText("Unique label");

    expect(first).not.toBeChecked();
    expect(second).not.toBeChecked();

    // Toggling on first has no effect on second
    await user.click(first);
    expect(first).toBeChecked();
    expect(second).not.toBeChecked();

    // Toggling on second has no effect on second
    await user.click(second);
    expect(first).toBeChecked();
    expect(second).toBeChecked();

    // Toggling off first has no effect on second
    await user.click(first);
    expect(first).not.toBeChecked();
    expect(second).toBeChecked();

    // Toggling off second has no effect on first
    await user.click(second);
    expect(first).not.toBeChecked();
    expect(second).not.toBeChecked();
  });

  it("ignore the exclusive ('or') option, regardless of label and data value", async () => {
    const mockProps = cloneDeep({ ...mockWithRepeatedOptions });

    // Replace current exclusive option to one with matching data value and label
    // Should not happen in well-authored content
    mockProps.groupedOptions![11] = {
      title: "Or",
      children: [
        {
          id: "V69z8B4VQW",
          data: {
            val: "alter.equipment.cctv",
            text: "CCTV cameras",
            exclusive: true,
          },
        },
      ],
    };

    const { user } = await setup(<Checklist {...mockProps} />);

    await user.click(screen.getByText("Electricals"));

    const repeatedOptions = screen.getAllByLabelText("CCTV cameras");

    expect(repeatedOptions).toHaveLength(2);

    const [groupedOption, exclusiveOption] = repeatedOptions;

    expect(groupedOption).not.toBeChecked();
    expect(exclusiveOption).not.toBeChecked();

    // Toggle grouped option on
    await user.click(groupedOption);
    expect(groupedOption).toBeChecked();

    // Exclusive option not toggled, despite matching label and data value
    expect(exclusiveOption).not.toBeChecked();

    // Toggle exclusive option on
    await user.click(exclusiveOption);
    expect(exclusiveOption).toBeChecked();

    // Normal behaviour - all other options toggled off
    expect(groupedOption).not.toBeChecked();

    // Toggle grouped option on
    await user.click(groupedOption);
    expect(groupedOption).toBeChecked();

    // Normal behaviour - exclusive option toggled off
    expect(exclusiveOption).not.toBeChecked();
  });

  it("adds all checked options to the passport", async () => {
    const handleSubmit = vi.fn();

    const { user } = await setup(
      <Checklist {...mockWithRepeatedOptions} handleSubmit={handleSubmit} />,
    );

    await user.click(screen.getByText("Common projects for homes"));
    await user.click(screen.getByText("Extensions"));

    const repeatedOptions = screen.getAllByLabelText("Roof extension");
    expect(repeatedOptions).toHaveLength(2);

    await user.click(repeatedOptions[0]);

    await user.click(screen.getByTestId("continue-button"));

    expect(handleSubmit).toHaveBeenCalledWith({
      // Node IDs for both "roof extension" options
      answers: ["Uw3nlbQHu1", "9r1IjubH9a"],
    });
  });
});

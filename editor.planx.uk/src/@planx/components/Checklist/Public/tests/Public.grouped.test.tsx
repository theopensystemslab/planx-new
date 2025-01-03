import { screen } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import Checklist from "../Public";
import {
  groupedOptions,
  groupedOptionsWithExclusiveOptions,
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
      />
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
      />
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
        groupedOptions={groupedOptionsWithExclusiveOptions}
      />
    );

    // user presses exclusive option in section 1
    await user.click(screen.getByText("Section 1"));
    const exclusiveOptionInSection1 = screen.getByLabelText("S1 Option1");
    const nonExclusiveOptionInSection1 = screen.getByLabelText("S1 Option2");
    await user.click(exclusiveOptionInSection1);

    expect(exclusiveOptionInSection1).toHaveAttribute("checked");

     // user presses non-exclusive option in section 1, exclusive option should uncheck.
    await user.click(nonExclusiveOptionInSection1);
    expect(exclusiveOptionInSection1).not.toHaveAttribute("checked");
    expect(nonExclusiveOptionInSection1).toHaveAttribute("checked");

     // user presses exclusive option in section 3
    await user.click(screen.getByText("Section 3"));
    const exclusiveOptionInSection3 = screen.getByLabelText("S3 Option2");
    await user.click(exclusiveOptionInSection3);

    // options in other checklists should not be affected
    expect(exclusiveOptionInSection3).toHaveAttribute("checked");
    expect(nonExclusiveOptionInSection1).toHaveAttribute("checked");

    // user presses two non-exclusive options in this section
    await user.click(screen.getByText("S3 Option1"));
    await user.click(screen.getByText("S3 Option3"));

    expect(exclusiveOptionInSection3).not.toHaveAttribute("checked");

    await user.click(screen.getByTestId("continue-button"));

    expect(handleSubmit).toHaveBeenCalledWith({
      answers: ["S1_Option2", "S3_Option1", "S3_Option3"],
    });
  });

  it("should not have any accessibility violations", async () => {
    const { container } = setup(
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
    const handleSubmit = vi.fn();

    const { user } = setup(
      <Checklist
        allRequired={false}
        description=""
        text="home type?"
        handleSubmit={handleSubmit}
        groupedOptions={groupedOptions}
      />
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
    // expect(handleSubmit).toHaveBeenCalledWith({
    //   answers: {
    //     "Section 1": [],
    //     "Section 2": ["S2_Option1", "S2_Option2"],
    //     "Section 3": [],
    //   },
    // });
  });
});

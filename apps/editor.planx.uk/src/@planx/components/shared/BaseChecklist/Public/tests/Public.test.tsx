import { ChecklistLayout } from "@planx/components/shared/BaseChecklist/model";
import { screen } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import Checklist from "../../../../Checklist/Public";
import { options } from "./mockOptions";
import { pressContinue, pressOption } from "./testUtils";

describe("Checklist Component - Basic & Images Layout", () => {
  [ChecklistLayout.Basic, ChecklistLayout.Images].forEach((type) => {
    it(`answers are submitted in order they were supplied (${ChecklistLayout[type]} layout)`, async () => {
      const handleSubmit = vi.fn();

      await setup(
        <Checklist
          allRequired={false}
          description=""
          text="home type?"
          handleSubmit={handleSubmit}
          options={options[type]!}
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

      const { user } = await setup(
        <Checklist
          allRequired={false}
          description=""
          text="home type?"
          handleSubmit={handleSubmit}
          previouslySubmittedData={{ answers: ["flat_id", "house_id"] }}
          options={options[type]!}
        />,
      );

      await user.click(screen.getByTestId("continue-button"));

      expect(handleSubmit).toHaveBeenCalledWith({
        answers: ["flat_id", "house_id"],
      });
    });

    it(`should not have any accessibility violations (${ChecklistLayout[type]} layout)`, async () => {
      const { container } = await setup(
        <Checklist
          allRequired={false}
          description=""
          text="home type?"
          options={options[type]!}
        />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test(`Focus jumps from checkbox to checkbox (${ChecklistLayout[type]} layout)`, async () => {
      const handleSubmit = vi.fn();

      const { user } = await setup(
        <Checklist
          allRequired={false}
          description=""
          text="home type?"
          handleSubmit={handleSubmit}
          options={options[type]!}
        />,
      );

      await user.tab();
      expect(screen.getByTestId("flat_id")).toHaveFocus();
      await user.tab();
      expect(screen.getByTestId("caravan_id")).toHaveFocus();
    });
  });
});

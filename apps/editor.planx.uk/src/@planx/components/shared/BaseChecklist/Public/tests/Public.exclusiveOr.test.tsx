import { screen } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";

import Checklist from "../../../../Checklist/Public";
import { optionsWithExclusiveOption } from "./mockOptions";
import { pressContinue, pressOption } from "./testUtils";

describe("when a user selects the exclusive 'or' option and nothing else", () => {
  it("does not throw an error on submit", async () => {
    const handleSubmit = vi.fn();

    setup(
      <Checklist
        allRequired={false}
        description=""
        text="Which permanent structures have you lived in?"
        handleSubmit={handleSubmit}
        options={optionsWithExclusiveOption}
      />,
    );
    expect(screen.getByRole("heading")).toHaveTextContent(
      "Which permanent structures have you lived in?",
    );

    await pressOption("Tent");

    await pressContinue();

    expect(handleSubmit).toHaveBeenCalledWith({
      answers: ["tent_id"],
    });
  });
});

describe.each([
  {
    optionType: "a non-exclusive",
    optionLabelText: "Caravan",
    oppositeOptionLabelText: "Tent",
  },
  {
    optionType: "an exclusive",
    optionLabelText: "Tent",
    oppositeOptionLabelText: "Caravan",
  },
])(
  "when a user selects $optionType option",
  ({ oppositeOptionLabelText, optionLabelText }) => {
    it("deselects it when the opposite type of option is selected", async () => {
      const { getByLabelText } = setup(
        <Checklist
          allRequired={false}
          description=""
          text="Which permanent structures have you lived in?"
          options={optionsWithExclusiveOption}
        />,
      );
      const firstSelectedOption = getByLabelText(optionLabelText);
      const secondSelectedOption = getByLabelText(oppositeOptionLabelText);

      await pressOption(optionLabelText);

      expect(firstSelectedOption).toBeChecked();

      await pressOption(oppositeOptionLabelText);

      expect(firstSelectedOption).not.toBeChecked();
      expect(secondSelectedOption).toBeChecked();
    });
  },
);

describe("when an exclusiveOr option is configured", () => {
  it("does not affect the user's ability to select multiple other options", async () => {
    const handleSubmit = vi.fn();

    setup(
      <Checklist
        allRequired={false}
        description=""
        text="Which permanent structures have you lived in?"
        handleSubmit={handleSubmit}
        options={optionsWithExclusiveOption}
      />,
    );
    expect(screen.getByRole("heading")).toHaveTextContent(
      "Which permanent structures have you lived in?",
    );

    await pressOption("Caravan");
    await pressOption("House");

    await pressContinue();

    expect(handleSubmit).toHaveBeenCalledWith({
      answers: ["caravan_id", "house_id"],
    });
  });
});

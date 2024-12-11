import { screen } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";

import { Option } from "../../../shared/index";
import Checklist, { ChecklistLayout } from "../Public";
import { options } from "./mockOptions";
import { pressContinue, pressOption } from "./testUtils";

const tentOption = [
  {
    id: "tent_id",
    data: {
      text: "Tent",
    },
  },
] as Option[];

describe("when a user selects the exclusive 'or' option and nothing else", () => {
  it("does not throw an error on submit", async () => {
    const handleSubmit = vi.fn();

    setup(
      <Checklist
        allRequired={false}
        description=""
        text="Which permanent structures have you lived in?"
        handleSubmit={handleSubmit}
        options={options[ChecklistLayout.Basic]}
        exclusiveOrOption={tentOption}
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

  it("disables the other checkboxes", async () => {
    const { getByLabelText } = setup(
      <Checklist
        allRequired={false}
        description=""
        text="Which permanent structures have you lived in?"
        options={options[ChecklistLayout.Basic]}
        exclusiveOrOption={tentOption}
      />,
    );
    await pressOption("Tent");

    const nonExclusiveOption = getByLabelText("Caravan");

    expect(nonExclusiveOption).toBeDisabled();
  });
});

describe("when an exclusiveOr option is configured", () => {
  it("does not affect the user's ability to select multiple other options", async () => {
    const handleSubmit = vi.fn();

    setup(
      <Checklist
        allRequired={false}
        description=""
        text="Which permanent structures have you lived in?"
        handleSubmit={handleSubmit}
        options={options[ChecklistLayout.Basic]}
        exclusiveOrOption={tentOption}
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

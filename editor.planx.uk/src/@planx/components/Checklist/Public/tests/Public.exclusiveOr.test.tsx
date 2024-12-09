import { screen } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";

import Checklist, { ChecklistLayout } from "../Public";
import { options } from "./mockOptions";
import { pressContinue, pressOption } from "./testUtils";

describe("when a user selects the exclusive 'or' option and nothing else", () => {
  it("does not throw an error", async () => {
    const handleSubmit = vi.fn();

    setup(
      <Checklist
        allRequired={false}
        description=""
        text="Which Earth-based houses have you lived in?"
        handleSubmit={handleSubmit}
        options={options[ChecklistLayout.Basic]}
        exclusiveOrOption="Spaceship"
      />,
    );
    expect(screen.getByRole("heading")).toHaveTextContent(
      "Which Earth-based houses have you lived in?",
    );

    await pressOption("Spaceship");

    await pressContinue();

    expect(handleSubmit).toHaveBeenCalledWith({
      answers: ["spaceship_id"],
    });
  });

  // maybe for editor test
  it.todo(
    "styles the exclusive 'or' option correctly at the end of the checklist",
  );
});

describe("when a user selects the exclusive 'or' option alongside another option", () => {
  it("displays an error message and does not submit", async () => {
    const handleSubmit = vi.fn();

    setup(
      <Checklist
        allRequired={false}
        description=""
        text="Which Earth-based houses have you lived in?"
        handleSubmit={handleSubmit}
        options={options[ChecklistLayout.Basic]}
        exclusiveOrOption="Spaceship"
      />,
    );
    expect(screen.getByRole("heading")).toHaveTextContent(
      "Which Earth-based houses have you lived in?",
    );

    await pressOption("Spaceship");
    await pressOption("Flat");

    await pressContinue();

    const errorMessage = screen.getByText(
      'Cannot select "Spaceship" alongside other options',
    );

    expect(errorMessage).toBeVisible();
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});

describe("when an exclusiveOr option is configured", () => {
  it("does not affect the user's ability to select multiple other options", async () => {
    const handleSubmit = vi.fn();

    setup(
      <Checklist
        allRequired={false}
        description=""
        text="Which Earth-based houses have you lived in?"
        handleSubmit={handleSubmit}
        options={options[ChecklistLayout.Basic]}
        exclusiveOrOption="Spaceship"
      />,
    );
    expect(screen.getByRole("heading")).toHaveTextContent(
      "Which Earth-based houses have you lived in?",
    );

    await pressOption("Caravan");
    await pressOption("House");

    await pressContinue();

    expect(handleSubmit).toHaveBeenCalledWith({
      answers: ["caravan_id", "house_id"],
    });
  });
});

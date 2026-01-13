import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import React from "react";
import server from "test/mockServer";
import { setup } from "testUtils";

import { taskDefaults } from "../model";
import EnhancedTextInputComponent from ".";

const ORIGINAL =
  "The Proposal is for a sympathetic mansard roof to replace the flat roof to the ground and fist floor side extension at the property under planning consent 2018/5913/P. See Planning Statement in Support Attached (PDF)";

const ENHANCED =
  "Erection of a mansard roof extension to the flat roof of the side extension.";

const handlers = [
  http.post("*/ai/project-description/enhance", async () => {
    return HttpResponse.json(
      {
        original: ORIGINAL,
        enhanced: ENHANCED,
      },
      { status: 200 },
    );
  }),
];

beforeEach(() => {
  server.use(...handlers);
});

describe("Passport generation", () => {
  test("accepting the enhancement", async () => {
    const handleSubmit = vi.fn();

    const { user } = setup(
      <EnhancedTextInputComponent
        id="testId"
        title="test"
        task={"projectDescription"}
        handleSubmit={handleSubmit}
        {...taskDefaults.projectDescription}
      />,
    );

    await user.type(screen.getByRole("textbox", { name: /test/i }), ORIGINAL);
    await user.click(screen.getByTestId("continue-button"));

    // Wait for next screen
    expect(
      screen.getByText(taskDefaults.projectDescription.revisionTitle),
    ).toBeVisible();

    // Accept suggestion
    await user.click(screen.getByTestId("continue-button"));

    // Breadcrumb formatted as expected
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          "project.description": ENHANCED,
          "enhancedTextInput.project.description.action":
            "Accepted the AI-enhanced description",
          _enhancements: {
            "project.description": {
              original: ORIGINAL,
              enhanced: ENHANCED,
            },
          },
        },
      }),
    );
  });

  test("retaining the original description", async () => {
    const handleSubmit = vi.fn();

    const { user } = setup(
      <EnhancedTextInputComponent
        id="testId"
        title="test"
        task={"projectDescription"}
        handleSubmit={handleSubmit}
        {...taskDefaults.projectDescription}
      />,
    );

    await user.type(screen.getByRole("textbox", { name: /test/i }), ORIGINAL);
    await user.click(screen.getByTestId("continue-button"));

    // Wait for next screen
    expect(
      screen.getByText(taskDefaults.projectDescription.revisionTitle),
    ).toBeVisible();

    // Switch back to original
    user.click(
      screen.getByRole("button", { name: "Revert to original description" }),
    );
    await user.click(screen.getByTestId("continue-button"));

    // Breadcrumb formatted as expected
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          "project.description": ORIGINAL,
          "enhancedTextInput.project.description.action":
            "Retained their original description",
          _enhancements: {
            "project.description": {
              original: ORIGINAL,
              enhanced: ENHANCED,
            },
          },
        },
      }),
    );
  });

  test("using a hybrid value", async () => {
    const handleSubmit = vi.fn();

    const { user } = setup(
      <EnhancedTextInputComponent
        id="testId"
        title="test"
        task={"projectDescription"}
        handleSubmit={handleSubmit}
        {...taskDefaults.projectDescription}
      />,
    );

    await user.type(screen.getByRole("textbox", { name: /test/i }), ORIGINAL);
    await user.click(screen.getByTestId("continue-button"));

    // Wait for next screen
    expect(
      screen.getByText(taskDefaults.projectDescription.revisionTitle),
    ).toBeVisible();

    // Enter a value which is neither original or enhanced, overwriting previous value
    await user.type(
      screen.getByRole("textbox", { name: /test/i }),
      "a new description",
      {
        initialSelectionStart: 0,
        initialSelectionEnd: ORIGINAL.length,
      },
    );
    await user.click(screen.getByTestId("continue-button"));

    // Breadcrumb formatted as expected
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          "project.description": "a new description",
          "enhancedTextInput.project.description.action":
            "Re-wrote their description follow AI feedback",
          _enhancements: {
            "project.description": {
              original: ORIGINAL,
              enhanced: ENHANCED,
            },
          },
        },
      }),
    );
  });
});

it.todo("basic layout and behaviour");
it.todo("should not have any accessibility violations on initial load");
it.todo("error states");
it.todo("loading states");
it.todo("navigating 'back'");

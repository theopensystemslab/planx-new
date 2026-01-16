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
            "Re-wrote their description after AI feedback",
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

describe("navigating back to the EnhancedTextInput component", () => {
  const previouslySubmittedData = {
    auto: false,
    createdAt: "2026-01-12T15:12:40.994Z",
    seq: 1,
    data: {
      "project.description": "My hybrid response",
      "enhancedTextInput.project.description.action":
        "Re-wrote their description after AI feedback",
      _enhancements: {
        "project.description": {
          original: "my first attempt",
          enhanced: "our LLM-enhanced suggestion",
        },
      },
    },
  };

  it("returns the user to the original input screen", async () => {
    setup(
      <EnhancedTextInputComponent
        id="testId"
        title="test"
        task={"projectDescription"}
        previouslySubmittedData={previouslySubmittedData}
        {...taskDefaults.projectDescription}
      />,
    );

    // User lands on original "input" step
    const textbox = screen.getByRole("textbox", { name: /test/i });
    expect(textbox).toBeVisible();
    expect(textbox).toHaveValue(
      previouslySubmittedData.data["project.description"],
    );
    expect(
      screen.queryByRole("heading", {
        name: "We suggest revising your project description",
        level: 2,
      }),
    ).not.toBeInTheDocument();
  });

  it("pre-populates their previous answer", () => {
    setup(
      <EnhancedTextInputComponent
        id="testId"
        title="test"
        task={"projectDescription"}
        previouslySubmittedData={previouslySubmittedData}
        {...taskDefaults.projectDescription}
      />,
    );

    expect(screen.getByRole("textbox", { name: /test/i })).toHaveValue(
      previouslySubmittedData.data["project.description"],
    );
  });

  test("proceeding forwards again, without making a change", async () => {
    const handleSubmit = vi.fn();

    const { user } = setup(
      <EnhancedTextInputComponent
        id="testId"
        title="test"
        task={"projectDescription"}
        previouslySubmittedData={previouslySubmittedData}
        handleSubmit={handleSubmit}
        {...taskDefaults.projectDescription}
      />,
    );

    await user.click(screen.getByTestId("continue-button"));

    // User is not on "task" step, but immediately goes to next node
    expect(
      screen.queryByText(taskDefaults.projectDescription.revisionTitle),
    ).not.toBeInTheDocument();

    // Breadcrumb not amended as user has made no changes
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ data: previouslySubmittedData.data }),
    );
  });

  test("proceeding forwards again, with a change", async () => {
    const handleSubmit = vi.fn();

    const { user } = setup(
      <EnhancedTextInputComponent
        id="testId"
        title="test"
        task={"projectDescription"}
        previouslySubmittedData={previouslySubmittedData}
        handleSubmit={handleSubmit}
        {...taskDefaults.projectDescription}
      />,
    );

    // User navigate back and then enters a new description
    await user.type(screen.getByRole("textbox", { name: /test/i }), ORIGINAL, {
      initialSelectionStart: 0,
      initialSelectionEnd:
        previouslySubmittedData.data["project.description"].length,
    });
    await user.click(screen.getByTestId("continue-button"));

    // Wait for next screen
    expect(
      screen.getByText(taskDefaults.projectDescription.revisionTitle),
    ).toBeVisible();

    // Proceed with new AI-enhanced description
    await user.click(screen.getByTestId("continue-button"));

    // Breadcrumb formatted as expected - action and values updated
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
});

it.todo("basic layout and behaviour");
it.todo("should not have any accessibility violations on initial load");
it.todo("error states");
it.todo("loading states");
it.todo("navigating 'back'");

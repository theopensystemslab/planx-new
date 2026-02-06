import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import React from "react";
import server from "test/mockServer";
import { setup } from "testUtils";
import { axe } from "vitest-axe";

import { taskDefaults } from "../model";
import EnhancedTextInputComponent from ".";

const requestSpy = vi.fn();

const ORIGINAL =
  "The Proposal is for a sympathetic mansard roof to replace the flat roof to the ground and fist floor side extension at the property under planning consent 2018/5913/P. See Planning Statement in Support Attached (PDF)";

const ENHANCED =
  "Erection of a mansard roof extension to the flat roof of the side extension.";

const handlers = [
  http.post("*/ai/project-description/enhance", async ({ request }) => {
    const payload = await request.json();
    requestSpy(payload);

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
  requestSpy.mockClear();
  server.use(...handlers);
});

describe("Passport generation", () => {
  test("accepting the enhancement", async () => {
    const handleSubmit = vi.fn();

    const { user } = await setup(
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

    // Select suggested description and submit
    await user.click(
      screen.getByRole("radio", { name: /Use suggested description/i }),
    );
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

    const { user } = await setup(
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

    // Select original description and submit
    await user.click(
      screen.getByRole("radio", { name: /Use your original description/i }),
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

    const { user } = await setup(
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

    // Select "Write a new description" to reveal the text input
    await user.click(
      screen.getByRole("radio", { name: /Write a new description/i }),
    );

    // Enter a custom description
    await user.type(
      screen.getByRole("textbox", { name: /Enter your project description/i }),
      "a new description",
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
    await setup(
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

  it("pre-populates their previous answer", async () => {
    await setup(
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

    const { user } = await setup(
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

    const { user } = await setup(
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

    // Select suggested description and submit
    await user.click(
      screen.getByRole("radio", { name: /Use suggested description/i }),
    );
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

describe("basic layout and behaviour", () => {
  it("loads the 'input' step first", async () => {
    await setup(
      <EnhancedTextInputComponent
        id="testId"
        title="Describe the project"
        task={"projectDescription"}
        {...taskDefaults.projectDescription}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Describe the project", level: 1 }),
    ).toBeVisible();
    expect(
      screen.queryByText("We suggest revising your project description"),
    ).not.toBeInTheDocument();
  });

  it("should not have any accessibility violations on the 'input' step", async () => {
    const { container } = await setup(
      <EnhancedTextInputComponent
        id="testId"
        title="test"
        task={"projectDescription"}
        {...taskDefaults.projectDescription}
      />,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("enforces a character limit", async () => {
    const handleSubmit = vi.fn();

    const { user } = await setup(
      <EnhancedTextInputComponent
        id="testId"
        title="test"
        task={"projectDescription"}
        handleSubmit={handleSubmit}
        {...taskDefaults.projectDescription}
      />,
    );

    expect(screen.getByText("You have 250 characters remaining")).toBeVisible();

    await user.type(
      screen.getByRole("textbox", { name: /test/i }),
      ORIGINAL + ORIGINAL,
    );
    expect(screen.getByText("You have 182 characters too many")).toBeVisible();

    await user.click(screen.getByTestId("continue-button"));

    expect(
      screen.getByText("Error: Your answer must be 250 characters or fewer"),
    ).toBeVisible();
    expect(handleSubmit).not.toHaveBeenCalled();
  }, 10_000);

  it("loads the 'task' step and displays the API result to the user", async () => {
    const { user } = await setup(
      <EnhancedTextInputComponent
        id="testId"
        title="test"
        task={"projectDescription"}
        {...taskDefaults.projectDescription}
      />,
    );

    await user.type(screen.getByRole("textbox", { name: /test/i }), ORIGINAL);
    await user.click(screen.getByTestId("continue-button"));

    // Wait for next screen
    expect(
      screen.getByText(taskDefaults.projectDescription.revisionTitle),
    ).toBeVisible();

    // API results displayed to user as radio options
    expect(
      screen.getByRole("radio", { name: /Use suggested description/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: /Use your original description/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: /Write a new description/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(ENHANCED)).toBeVisible();
    expect(screen.getByText(ORIGINAL)).toBeVisible();
  });

  it("should not have any accessibility violations on the 'task' step", async () => {
    const { container, user } = await setup(
      <EnhancedTextInputComponent
        id="testId"
        title="test"
        task={"projectDescription"}
        {...taskDefaults.projectDescription}
      />,
    );

    await user.type(screen.getByRole("textbox", { name: /test/i }), ORIGINAL);
    await user.click(screen.getByTestId("continue-button"));

    // Wait for next screen
    expect(
      screen.getByText(taskDefaults.projectDescription.revisionTitle),
    ).toBeVisible();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("allows the user to select between the enhanced, original, or custom description", async () => {
    const { user } = await setup(
      <EnhancedTextInputComponent
        id="testId"
        title="test"
        task={"projectDescription"}
        {...taskDefaults.projectDescription}
      />,
    );

    await user.type(screen.getByRole("textbox", { name: /test/i }), ORIGINAL);
    await user.click(screen.getByTestId("continue-button"));

    // Wait for next screen
    expect(
      screen.getByText(taskDefaults.projectDescription.revisionTitle),
    ).toBeVisible();

    // No option selected by default, custom textarea not visible
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();

    // User can select suggested description
    await user.click(
      screen.getByRole("radio", { name: /Use suggested description/i }),
    );
    expect(
      screen.getByRole("radio", { name: /Use suggested description/i }),
    ).toBeChecked();

    // User can select original description
    await user.click(
      screen.getByRole("radio", { name: /Use your original description/i }),
    );
    expect(
      screen.getByRole("radio", { name: /Use your original description/i }),
    ).toBeChecked();

    // User can select to write a new description - textarea appears
    await user.click(
      screen.getByRole("radio", { name: /Write a new description/i }),
    );
    expect(
      screen.getByRole("radio", { name: /Write a new description/i }),
    ).toBeChecked();
    expect(
      screen.getByRole("textbox", { name: /Enter your project description/i }),
    ).toBeVisible();

    // User can type their own custom description
    await user.type(
      screen.getByRole("textbox", { name: /Enter your project description/i }),
      "Something unique",
    );
    expect(
      screen.getByRole("textbox", { name: /Enter your project description/i }),
    ).toHaveValue("Something unique");
  });

  it("displays additional information to the user on the 'task' step", async () => {
    const { user } = await setup(
      <EnhancedTextInputComponent
        id="testId"
        title="test"
        task={"projectDescription"}
        howMeasured="Lorem ipsum dolor sit amet"
        policyRef="Lorem ipsum dolor sit amet"
        info="Lorem ipsum dolor sit amet"
        {...taskDefaults.projectDescription}
      />,
    );

    // More information sidebar is present
    const moreInfoButton = screen.getByTestId("more-info-button");
    expect(moreInfoButton).toBeVisible();

    await user.click(moreInfoButton);
    expect(
      screen.getByRole("heading", { level: 2, name: "Why does it matter?" }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { level: 2, name: "Source" }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { level: 2, name: "How is it defined?" }),
    ).toBeVisible();

    // Exit sidebar
    await user.keyboard("{Esc}");

    await user.type(screen.getByRole("textbox", { name: /test/i }), ORIGINAL);
    await user.click(screen.getByTestId("continue-button"));

    // Wait for next screen
    expect(
      screen.getByText(taskDefaults.projectDescription.revisionTitle),
    ).toBeVisible();

    // More information sidebar is not present
    expect(
      screen.queryByRole("button", { name: "More information" }),
    ).not.toBeInTheDocument();

    // "How does this work?" button is present
    const howDoesThisWorkButton = screen.getByTestId("more-info-button");
    expect(howDoesThisWorkButton).toBeVisible();

    // Sidebar opens to display unique help text
    await user.click(howDoesThisWorkButton);
    expect(
      screen.getByRole("heading", { level: 2, name: "How does this work?" }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { level: 2, name: "Our AI principles" }),
    ).toBeVisible();

    // Exit sidebar
    await user.keyboard("{Esc}");
  });

  test("users can navigate 'back' to the input step", async () => {
    const { user } = await setup(
      <EnhancedTextInputComponent
        id="testId"
        title="test"
        task={"projectDescription"}
        {...taskDefaults.projectDescription}
      />,
    );

    // "Back" button not visible on the "input" step
    expect(
      screen.queryByRole("button", { name: "Back" }),
    ).not.toBeInTheDocument();

    // Proceed to "task" step
    await user.type(screen.getByRole("textbox", { name: /test/i }), ORIGINAL);
    await user.click(screen.getByTestId("continue-button"));
    expect(
      screen.getByText(taskDefaults.projectDescription.revisionTitle),
    ).toBeVisible();

    // "Back" button present...
    const backButton = screen.getByRole("button", { name: "Back" });
    expect(backButton).toBeVisible();

    // ...and clicking it returns the user to the "input step"
    await user.click(backButton);
    expect(screen.getByRole("textbox", { name: /test/i })).toBeVisible();
  });

  test("navigating 'back' allows the user to re-trigger the API when given a new input", async () => {
    const { user } = await setup(
      <EnhancedTextInputComponent
        id="testId"
        title="test"
        task={"projectDescription"}
        {...taskDefaults.projectDescription}
      />,
    );

    // Proceed to "task" step
    await user.type(screen.getByRole("textbox", { name: /test/i }), ORIGINAL);
    await user.click(screen.getByTestId("continue-button"));
    expect(
      screen.getByText(taskDefaults.projectDescription.revisionTitle),
    ).toBeVisible();

    // Navigate 'back'
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("textbox", { name: /test/i })).toBeVisible();

    const NEW_INPUT = "A new description because I've changed my mind";

    // Enter new description, triggering a new API request
    await user.type(screen.getByRole("textbox", { name: /test/i }), NEW_INPUT, {
      initialSelectionStart: 0,
      initialSelectionEnd: ENHANCED.length,
    });
    await user.click(screen.getByTestId("continue-button"));

    expect(requestSpy).toHaveBeenCalledTimes(2);
    expect(requestSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        original: expect.stringMatching(NEW_INPUT),
      }),
    );
  });

  // Revisit this with new UI which doesn't contain a textinput natively on the second step
  test.skip("navigating 'back' does not re-trigger the API when the input does not change", async () => {
    const { user } = await setup(
      <EnhancedTextInputComponent
        id="testId"
        title="test"
        task={"projectDescription"}
        {...taskDefaults.projectDescription}
      />,
    );

    // Proceed to "task" step
    await user.type(screen.getByRole("textbox", { name: /test/i }), ORIGINAL);
    await user.click(screen.getByTestId("continue-button"));
    expect(
      screen.getByText(taskDefaults.projectDescription.revisionTitle),
    ).toBeVisible();
    expect(requestSpy).toHaveBeenCalledTimes(1);

    // Navigate 'back'
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("textbox", { name: /test/i })).toBeVisible();

    // Retain original descriptions, avoiding re-triggering of the API
    await user.click(screen.getByTestId("continue-button"));

    // API not re-hit, we retain value from cache
    expect(requestSpy).toHaveBeenCalledTimes(1);
  });
});

it.todo("loading states");

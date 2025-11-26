import { ComponentType } from "@opensystemslab/planx-core/types";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { setup } from "testUtils";

import { Condition, Operator } from "../shared/RuleBuilder/types";
import ResponsiveQuestion from "./Editor";

it("renders without error", () => {
  setup(
    <DndProvider backend={HTML5Backend}>
      <ResponsiveQuestion node={{}} options={[]} />
    </DndProvider>,
  );
  expect(screen.getByText("Responsive question")).toBeInTheDocument();
  expect(screen.getByText("add new option")).toBeInTheDocument();
});

it("displays the options editor when the 'add new option' button is clicked", async () => {
  const { user } = setup(
    <DndProvider backend={HTML5Backend}>
      <ResponsiveQuestion node={{}} options={[]} />
    </DndProvider>,
  );
  await user.click(screen.getByRole("button", { name: /add new/i }));

  const optionsEditor = await screen.findByPlaceholderText("Option");
  expect(optionsEditor).toBeInTheDocument();

  const ruleBuilder = await screen.findByText("Rule");
  expect(ruleBuilder).toBeInTheDocument();
});

it("populates the modal with existing data", async () => {
  setup(
    <DndProvider backend={HTML5Backend}>
      <ResponsiveQuestion
        node={{ data: { text: "My title", description: "My description" } }}
        options={[
          {
            id: "1",
            data: {
              text: "First option",
              rule: { condition: Condition.AlwaysRequired },
            },
          },
          {
            id: "2",
            data: {
              text: "Second option",
              rule: {
                condition: Condition.RequiredIf,
                operator: Operator.Equals,
                fn: "mockFn",
                val: "mockVal",
              },
            },
          },
        ]}
      />
    </DndProvider>,
  );

  expect(screen.getByDisplayValue("My title")).toBeVisible();
  expect(screen.getByText("My description")).toBeVisible();
  expect(screen.getByText("First option")).toBeVisible();
  expect(screen.getByText("Second option")).toBeVisible();
});

it("can construct a valid payload", async () => {
  const handleSubmit = vi.fn();
  const { user } = setup(
    <DndProvider backend={HTML5Backend}>
      <ResponsiveQuestion node={{}} options={[]} handleSubmit={handleSubmit} />
    </DndProvider>,
  );

  // Set title
  await user.type(screen.getByPlaceholderText("Text"), "mockTitle");

  // Add first option with default rule
  await user.click(screen.getByRole("button", { name: /add new/i }));
  await user.type(screen.getByPlaceholderText("Option"), "First Option");
  expect(screen.getByText("Always required")).toBeVisible();

  // Add second option with conditional rule
  await user.click(screen.getByRole("button", { name: /add new/i }));
  await user.type(screen.getAllByPlaceholderText("Option")[1], "Second Option");

  const ruleDropdowns = screen.getAllByText("Always required");
  expect(ruleDropdowns).toHaveLength(2);

  await user.click(ruleDropdowns[1]);
  await user.click(await screen.findByRole("option", { name: /required if/i }));

  const conditionalField = (
    await screen.findAllByPlaceholderText("Data field")
  ).at(-1);
  expect(conditionalField).toBeInTheDocument();
  await user.type(conditionalField!, "mockOptionFn");

  const conditionalValue = (await screen.findAllByPlaceholderText("Value")).at(
    -1,
  );
  expect(conditionalValue).toBeInTheDocument();
  await user.type(conditionalValue!, "mockOptionVal{enter}");

  // Submit form
  fireEvent.submit(screen.getByTestId("question-component-form"));

  await waitFor(() =>
    expect(handleSubmit).toHaveBeenCalledWith(
      // ResponsiveQuestion node
      expect.objectContaining({
        type: ComponentType.ResponsiveQuestion,
        data: expect.objectContaining({
          text: "mockTitle",
        }),
      }),
      expect.arrayContaining([
        // First Answer node
        expect.objectContaining({
          type: ComponentType.Answer,
          data: expect.objectContaining({
            text: "First Option",
            rule: expect.objectContaining({
              condition: "AlwaysRequired",
            }),
          }),
        }),
        // Second Answer node
        expect.objectContaining({
          type: ComponentType.Answer,
          data: expect.objectContaining({
            text: "Second Option",
            rule: expect.objectContaining({
              condition: "RequiredIf",
              fn: "mockOptionFn",
              val: "mockOptionVal",
            }),
          }),
        }),
      ]),
    ),
  );
}, 20_000);

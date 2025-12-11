import { ComponentType } from "@opensystemslab/planx-core/types";
import { type ConditionalOption } from "@planx/components/Option/model";
import { Group } from "@planx/components/shared/BaseChecklist/model";
import { EditorProps } from "@planx/components/shared/types";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
// eslint-disable-next-line no-restricted-imports
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { setup } from "testUtils";
import { vi } from "vitest";

import { Condition } from "../shared/RuleBuilder/types";
import ResponsiveChecklistEditor from "./Editor";
import { ResponsiveChecklist } from "./model";

const { getState } = useStore;

describe("Responsive Checklist editor component", async () => {
  beforeEach(() => {
    getState().setUser({
      id: 1,
      firstName: "Editor",
      lastName: "Test",
      isPlatformAdmin: true,
      isAnalyst: true,
      email: "test@test.com",
      teams: [],
      jwt: "x.y.z",
    });
  });

  it("renders without error", async () => {
    await setup(
      <DndProvider backend={HTML5Backend}>
        <ResponsiveChecklistEditor options={[]} />
      </DndProvider>,
    );
    expect(screen.getByText("Responsive checklist")).toBeInTheDocument();
    expect(screen.getByText("Add option")).toBeInTheDocument();
  });

  it("displays the grouped checklist inputs when the 'expandable' toggle is clicked", async () => {
    const { user } = await setup(
      <DndProvider backend={HTML5Backend}>
        <ResponsiveChecklistEditor options={[]} />
      </DndProvider>,
    );

    await user.click(screen.getByLabelText("Expandable"));

    const groupedOptionsEditor =
      await screen.findByPlaceholderText("Section Title");
    expect(groupedOptionsEditor).toBeInTheDocument();
  });

  it("displays the options editor when the 'Add option' button is clicked", async () => {
    const { user } = await setup(
      <DndProvider backend={HTML5Backend}>
        <ResponsiveChecklistEditor options={[]} />
      </DndProvider>,
    );

    await user.click(screen.getByRole("button", { name: /Add option/i }));

    const optionsEditor = await screen.findByPlaceholderText("Option");
    expect(optionsEditor).toBeInTheDocument();
  });

  it("adds a new section when the 'add group' button is clicked", async () => {
    const { user } = await setup(
      <DndProvider backend={HTML5Backend}>
        <ResponsiveChecklistEditor options={[]} />
      </DndProvider>,
    );

    await user.click(screen.getByLabelText("Expandable"));

    await screen.findByPlaceholderText("Section Title");

    await user.click(screen.getByRole("button", { name: /Add group/i }));

    expect(await screen.findAllByPlaceholderText("Section Title")).toHaveLength(
      2,
    );
  });

  it("shows the 'add exclusive or' button only when an option has been added already", async () => {
    const { user } = await setup(
      <DndProvider backend={HTML5Backend}>
        <ResponsiveChecklistEditor options={[]} />
      </DndProvider>,
    );

    expect(
      screen.queryByRole("button", { name: /Add "or" option/i }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Add option/i }));

    expect(
      screen.queryByRole("button", { name: /Add "or" option/i }),
    ).toBeInTheDocument();
  });

  it("shows an error if no options set a data field, but one is set at the top level", async () => {
    const { user } = await setup(
      <DndProvider backend={HTML5Backend}>
        <ResponsiveChecklistEditor options={[]} />
      </DndProvider>,
    );

    const autocompleteComponent = screen.getByTestId("checklist-data-field");
    const autocompleteInput = within(autocompleteComponent).getByRole(
      "combobox",
    );

    // Set a top-level data field
    await user.click(autocompleteInput);
    await user.type(autocompleteInput, "my.data.value");
    await user.keyboard("{Enter}");

    // An an option without a data field
    await user.click(screen.getByRole("button", { name: /Add option/i }));
    await user.type(screen.getByPlaceholderText("Option"), "First");

    fireEvent.submit(screen.getByTestId("checklistEditorForm"));

    await waitFor(() =>
      expect(
        screen.getByText(/At least one option must also set a data field/),
      ).toBeInTheDocument(),
    );
  }, 20_000);

  it("does not show an error if at least one option sets a data field", async () => {
    const handleSubmit = vi.fn();

    const { user } = await setup(
      <DndProvider backend={HTML5Backend}>
        <ResponsiveChecklistEditor options={[]} handleSubmit={handleSubmit} />
      </DndProvider>,
    );

    const autocompleteComponent = screen.getByTestId("checklist-data-field");
    const autocompleteInput = within(autocompleteComponent).getByRole(
      "combobox",
    );

    // Set a top-level data field
    await user.click(autocompleteInput);
    await user.type(autocompleteInput, "my.data.value");
    await user.keyboard("{Enter}");

    // An an option without a data field
    await user.click(screen.getByRole("button", { name: /Add option/i }));
    await user.type(screen.getByPlaceholderText("Option"), "First");

    // An another option, this time with a data field
    await user.click(screen.getByRole("button", { name: /Add option/i }));
    await user.type(screen.getAllByPlaceholderText("Option")[1], "Second");
    const autocompleteComponentOption = screen.getByTestId(
      "data-field-autocomplete-option-1",
    );
    const autocompleteInputOption = within(
      autocompleteComponentOption,
    ).getByRole("combobox");
    await user.click(autocompleteInputOption);
    await user.type(autocompleteInputOption, "my.option.data.value");
    await user.keyboard("{Enter}");

    fireEvent.submit(screen.getByTestId("checklistEditorForm"));

    await waitFor(() => expect(handleSubmit).toHaveBeenCalled());
  }, 50_000);

  it("only allows a single exclusive option to be added", async () => {
    const { user } = await setup(
      <DndProvider backend={HTML5Backend}>
        <ResponsiveChecklistEditor options={[]} />
      </DndProvider>,
    );

    await user.click(screen.getByRole("button", { name: /Add option/i }));
    await user.type(screen.getByPlaceholderText("Option"), "First");

    const addExclusiveOptionButton = screen.getByRole("button", {
      name: /Add "or" option/i,
    });
    expect(addExclusiveOptionButton).toBeInTheDocument();

    await user.click(addExclusiveOptionButton);
    expect(screen.getByPlaceholderText("Exclusive 'or' option")).toBeVisible();

    expect(
      screen.queryByRole("button", {
        name: /Add "or" option/i,
      }),
    ).not.toBeInTheDocument();
  });

  /**
   * The UI does not allow many exclusive options to be added (see prior test)
   * Set up mock data to trigger this state and test the validation schema
   */
  it("shows an error if multiple exclusive options are configured", async () => {
    const props: EditorProps<
      ComponentType.ResponsiveChecklist,
      ResponsiveChecklist
    > = {
      node: {
        data: {
          text: "Many exclusive options",
        },
      },
      disabled: false,
    };

    const options: ConditionalOption[] = [
      {
        id: "AF4400H41Z",
        data: {
          text: "A regular option",
          rule: { condition: Condition.AlwaysRequired },
        },
      },
      {
        id: "0WeNTfghL4",
        data: {
          text: "First exclusive option",
          exclusive: true,
          rule: { condition: Condition.AlwaysRequired },
        },
      },
      {
        id: "0WeNTfghL5",
        data: {
          text: "Second exclusive option",
          exclusive: true,
          rule: { condition: Condition.AlwaysRequired },
        },
      },
    ];

    const handleSubmit = vi.fn();

    await setup(
      <DndProvider backend={HTML5Backend}>
        <ResponsiveChecklistEditor
          handleSubmit={handleSubmit}
          options={options}
          {...props}
        />
      </DndProvider>,
    );

    fireEvent.submit(screen.getByTestId("checklistEditorForm"));

    expect(handleSubmit).not.toHaveBeenCalled();

    await waitFor(() =>
      expect(
        screen.getByText(
          /There should be a maximum of one exclusive option configured/,
        ),
      ).toBeInTheDocument(),
    );
  });

  it("populates existing options", async () => {
    const props: EditorProps<
      ComponentType.ResponsiveChecklist,
      ResponsiveChecklist
    > = {
      node: {
        data: {
          text: "mockText",
        },
      },
      disabled: false,
    };

    const options: ConditionalOption[] = [
      {
        id: "AF4400H41Z",
        data: {
          text: "Apple",
          rule: { condition: Condition.AlwaysRequired },
        },
      },
      {
        id: "0WeNTfghL4",
        data: {
          text: "Banana",
          rule: { condition: Condition.AlwaysRequired },
        },
      },
      {
        id: "AF4400H41Y",
        data: {
          text: "Coconut",
          rule: { condition: Condition.AlwaysRequired },
        },
      },
      {
        id: "0WeNTfghL5",
        data: {
          text: "Date",
          rule: { condition: Condition.AlwaysRequired },
        },
      },
    ];

    const handleSubmit = vi.fn();

    await setup(
      <DndProvider backend={HTML5Backend}>
        <ResponsiveChecklistEditor
          handleSubmit={handleSubmit}
          options={options}
          {...props}
        />
      </DndProvider>,
    );

    expect(screen.getByDisplayValue("Apple")).toBeVisible();
    expect(screen.getByDisplayValue("Banana")).toBeVisible();
    expect(screen.getByDisplayValue("Coconut")).toBeVisible();
    expect(screen.getByDisplayValue("Date")).toBeVisible();
  });

  it("populates existing grouped options", async () => {
    const props: EditorProps<
      ComponentType.ResponsiveChecklist,
      ResponsiveChecklist
    > = {
      node: {
        data: {
          text: "mockText",
        },
      },
      disabled: false,
    };

    const groupedOptions: Group<ConditionalOption>[] = [
      {
        title: "First group",
        children: [
          {
            id: "AF4400H41Z",
            data: {
              text: "Apple",
              rule: { condition: Condition.AlwaysRequired },
            },
          },
          {
            id: "0WeNTfghL4",
            data: {
              text: "Banana",
              rule: { condition: Condition.AlwaysRequired },
            },
          },
        ],
      },
      {
        title: "Second group",
        children: [
          {
            id: "AF4400H41Y",
            data: {
              text: "Coconut",
              rule: { condition: Condition.AlwaysRequired },
            },
          },
          {
            id: "0WeNTfghL5",
            data: {
              text: "Date",
              rule: { condition: Condition.AlwaysRequired },
            },
          },
        ],
      },
    ];

    const handleSubmit = vi.fn();

    await setup(
      <DndProvider backend={HTML5Backend}>
        <ResponsiveChecklistEditor
          handleSubmit={handleSubmit}
          groupedOptions={groupedOptions}
          {...props}
        />
      </DndProvider>,
    );

    expect(screen.getByDisplayValue("First group")).toBeVisible();
    expect(screen.getByDisplayValue("Second group")).toBeVisible();
    expect(screen.getByDisplayValue("Apple")).toBeVisible();
    expect(screen.getByDisplayValue("Banana")).toBeVisible();
    expect(screen.getByDisplayValue("Coconut")).toBeVisible();
    expect(screen.getByDisplayValue("Date")).toBeVisible();
  });

  it("can construct a valid payload", async () => {
    const handleSubmit = vi.fn();
    const { user } = await setup(
      <DndProvider backend={HTML5Backend}>
        <ResponsiveChecklistEditor
          node={{}}
          options={[]}
          handleSubmit={handleSubmit}
        />
      </DndProvider>,
    );

    // Set title
    await user.type(screen.getByPlaceholderText("Text"), "mockTitle");

    // Add first option with default rule
    await user.click(screen.getByRole("button", { name: /Add option/i }));
    await user.type(screen.getByPlaceholderText("Option"), "First Option");
    expect(screen.getByText("Always required")).toBeVisible();

    // Add second option with conditional rule
    await user.click(screen.getByRole("button", { name: /Add option/i }));
    await user.type(
      screen.getAllByPlaceholderText("Option")[1],
      "Second Option",
    );

    const ruleDropdowns = screen.getAllByText("Always required");
    expect(ruleDropdowns).toHaveLength(2);

    await user.click(ruleDropdowns[1]);
    await user.click(
      await screen.findByRole("option", { name: /required if/i }),
    );

    const conditionalField = (
      await screen.findAllByPlaceholderText("Data field")
    ).at(-1);
    expect(conditionalField).toBeInTheDocument();
    await user.type(conditionalField!, "mockOptionFn");

    const conditionalValue = (
      await screen.findAllByPlaceholderText("Value")
    ).at(-1);
    expect(conditionalValue).toBeInTheDocument();
    await user.type(conditionalValue!, "mockOptionVal{enter}");

    // Submit form
    fireEvent.submit(screen.getByTestId("checklistEditorForm"));

    await waitFor(() =>
      expect(handleSubmit).toHaveBeenCalledWith(
        // ResponsiveQuestion node
        expect.objectContaining({
          type: ComponentType.ResponsiveChecklist,
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
});

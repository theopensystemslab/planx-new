import { ComponentType } from "@opensystemslab/planx-core/types";
import { Option } from "@planx/components/Option/model";
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

import { ChecklistEditor } from "./Editor";
import { Checklist } from "./model";

const { getState } = useStore;

describe("Checklist editor component", () => {
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

  it("renders without error", () => {
    setup(
      <DndProvider backend={HTML5Backend}>
        <ChecklistEditor options={[]} />
      </DndProvider>,
    );
    expect(screen.getByText("Checklist")).toBeInTheDocument();
    expect(screen.getByText("Add option")).toBeInTheDocument();
  });

  it("displays the grouped checklist inputs when the 'expandable' toggle is clicked", async () => {
    const { user } = setup(
      <DndProvider backend={HTML5Backend}>
        <ChecklistEditor options={[]} />
      </DndProvider>,
    );

    await user.click(screen.getByLabelText("Expandable"));

    const groupedOptionsEditor =
      await screen.findByPlaceholderText("Section Title");
    expect(groupedOptionsEditor).toBeInTheDocument();
  });

  it("displays the options editor when the 'Add option' button is clicked", async () => {
    const { user } = setup(
      <DndProvider backend={HTML5Backend}>
        <ChecklistEditor options={[]} />
      </DndProvider>,
    );

    await user.click(screen.getByRole("button", { name: /Add option/i }));

    const optionsEditor = await screen.findByPlaceholderText("Option");
    expect(optionsEditor).toBeInTheDocument();
  });

  it("adds a new section when the 'add group' button is clicked", async () => {
    const { user } = setup(
      <DndProvider backend={HTML5Backend}>
        <ChecklistEditor options={[]} />
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
    const { user } = setup(
      <DndProvider backend={HTML5Backend}>
        <ChecklistEditor options={[]} />
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

  it("shows an error if an exclusive 'or' option has been set alongside the 'all required' toggle", async () => {
    const { user } = setup(
      <DndProvider backend={HTML5Backend}>
        <ChecklistEditor options={[]} />
      </DndProvider>,
    );

    await user.click(screen.getByRole("button", { name: /Add option/i }));
    await user.type(screen.getByPlaceholderText("Option"), "First");

    await user.click(screen.getByRole("button", { name: /Add "or" option/i }));
    await user.type(
      screen.getByPlaceholderText("Exclusive 'or' option"),
      "Second",
    );

    await user.click(screen.getByLabelText("All required"));

    fireEvent.submit(screen.getByTestId("checklistEditorForm"));

    await waitFor(() =>
      expect(
        screen.getByText(
          /Cannot configure exclusive "or" option alongside "all required" setting/,
        ),
      ).toBeInTheDocument(),
    );
  }, 10_000);

  it("shows an error if 'never put to user' is toggled on without a data field", async () => {
    const { user } = setup(
      <DndProvider backend={HTML5Backend}>
        <ChecklistEditor options={[]} />
      </DndProvider>,
    );

    await user.click(
      screen.getByLabelText("Never put to user (default to blank automation)"),
    );

    fireEvent.submit(screen.getByTestId("checklistEditorForm"));

    await waitFor(() =>
      expect(
        screen.getByText(
          /Set a data field for the Checklist and all options but one when never putting to user/,
        ),
      ).toBeInTheDocument(),
    );
  });

  it("shows an error if no options set a data field, but one is set at the top level", async () => {
    const { user } = setup(
      <DndProvider backend={HTML5Backend}>
        <ChecklistEditor options={[]} />
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

    const { user } = setup(
      <DndProvider backend={HTML5Backend}>
        <ChecklistEditor options={[]} handleSubmit={handleSubmit} />
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
    const { user } = setup(
      <DndProvider backend={HTML5Backend}>
        <ChecklistEditor options={[]} />
      </DndProvider>,
    );

    await user.click(screen.getByRole("button", { name: /Add option/i }));
    await user.type(screen.getByPlaceholderText("Option"), "First");

    const addExclusiveOptionButton = screen.getByRole("button", {
      name: /Add "or" option/i,
    });
    expect(addExclusiveOptionButton).toBeEnabled();

    await user.click(addExclusiveOptionButton);
    expect(screen.getByPlaceholderText("Exclusive 'or' option")).toBeVisible();
    expect(addExclusiveOptionButton).toBeDisabled();
  });

  /**
   * The UI does not allow many exclusive options to be added (see prior test)
   * Set up mock data to trigger this state and test the validation schema
   */
  it("shows an error if multiple exclusive options are configured", async () => {
    const props: EditorProps<ComponentType.Checklist, Checklist> = {
      node: {
        data: {
          text: "Many exclusive options",
          allRequired: false,
          neverAutoAnswer: false,
          alwaysAutoAnswerBlank: false,
        },
      },
      disabled: false,
    };

    const options: Option[] = [
      {
        id: "AF4400H41Z",
        data: {
          text: "A regular option",
        },
      },
      {
        id: "0WeNTfghL4",
        data: {
          text: "First exclusive option",
          exclusive: true,
        },
      },
      {
        id: "0WeNTfghL5",
        data: {
          text: "Second exclusive option",
          exclusive: true,
        },
      },
    ];

    const handleSubmit = vi.fn();

    setup(
      <DndProvider backend={HTML5Backend}>
        <ChecklistEditor
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

  it("shows an error if 'never put to user' is toggled on and more than one option has a blank data field", async () => {
    const { user } = setup(
      <DndProvider backend={HTML5Backend}>
        <ChecklistEditor options={[]} />
      </DndProvider>,
    );

    // Set a top-level data field
    const autocompleteComponent = screen.getByTestId("checklist-data-field");
    const autocompleteInput = within(autocompleteComponent).getByRole(
      "combobox",
    );
    await user.click(autocompleteInput);
    await user.type(autocompleteInput, "my.data.value");
    await user.keyboard("{Enter}");

    user.click(screen.getByLabelText(/Never put to user/));

    const addNewOptionButton = screen.getByRole("button", {
      name: /Add option/i,
    });
    await user.click(addNewOptionButton);
    await user.click(addNewOptionButton);

    const [first, second] = screen.getAllByPlaceholderText("Option");

    await user.type(first, "First");
    await user.type(second, "Second");

    fireEvent.submit(screen.getByTestId("checklistEditorForm"));

    await waitFor(() =>
      expect(
        screen.getByText(
          /Exactly one option should have a blank data field when never putting to user/,
        ),
      ).toBeInTheDocument(),
    );
  }, 30_000);

  it("populates existing options", async () => {
    const props: EditorProps<ComponentType.Checklist, Checklist> = {
      node: {
        data: {
          text: "mockText",
          allRequired: false,
          neverAutoAnswer: false,
          alwaysAutoAnswerBlank: false,
        },
      },
      disabled: false,
    };

    const options: Option[] = [
      {
        id: "AF4400H41Z",
        data: {
          text: "Apple",
        },
      },
      {
        id: "0WeNTfghL4",
        data: {
          text: "Banana",
        },
      },
      {
        id: "AF4400H41Y",
        data: {
          text: "Coconut",
        },
      },
      {
        id: "0WeNTfghL5",
        data: {
          text: "Date",
        },
      },
    ];

    const handleSubmit = vi.fn();

    setup(
      <DndProvider backend={HTML5Backend}>
        <ChecklistEditor
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
    const props: EditorProps<ComponentType.Checklist, Checklist> = {
      node: {
        data: {
          text: "mockText",
          allRequired: false,
          neverAutoAnswer: false,
          alwaysAutoAnswerBlank: false,
        },
      },
      disabled: false,
    };

    const groupedOptions: Group<Option>[] = [
      {
        title: "First group",
        children: [
          {
            id: "AF4400H41Z",
            data: {
              text: "Apple",
            },
          },
          {
            id: "0WeNTfghL4",
            data: {
              text: "Banana",
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
            },
          },
          {
            id: "0WeNTfghL5",
            data: {
              text: "Date",
            },
          },
        ],
      },
    ];

    const handleSubmit = vi.fn();

    setup(
      <DndProvider backend={HTML5Backend}>
        <ChecklistEditor
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
});

import ChecklistComponent from "@planx/components/Checklist/Editor/Editor";
import { within } from "@testing-library/react";
import { TAG_DISPLAY_VALUES } from "pages/FlowEditor/components/Flow/components/Tag";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { act } from "react-dom/test-utils";
import { setup } from "testUtils";
import { it } from "vitest";

const { setState } = useStore;

const mockUser = {
  id: 200,
  firstName: "Testy",
  lastName: "McTester",
  email: "test@email.com",
  teams: [],
};

describe("Checklist Component for a Platform Admin", () => {
  beforeEach(() =>
    act(() =>
      setState({
        user: {
          ...mockUser,
          isPlatformAdmin: true,
        },
        teamSlug: "team",
      }),
    ),
  );

  it("renders all tags with none selected", async () => {
    const { getByRole, user } = setup(
      <DndProvider backend={HTML5Backend}>
        <ChecklistComponent text="" />
      </DndProvider>,
    );
    const tagSelect = getByRole("combobox", { name: /tag this component/i });

    await user.click(tagSelect);

    const optionsList = getByRole("listbox", { name: /tag this component/i });
    const options = within(optionsList).getAllByRole("option");

    const tagDisplayNames = Object.values(TAG_DISPLAY_VALUES).map(
      (tag) => tag.displayName,
    );
    const optionTexts = options.map((option) => option.textContent);

    expect(optionTexts).toEqual(expect.arrayContaining(tagDisplayNames));
  });

  it("renders all tags with Customisation selected as a button", async () => {
    const { queryByTestId, queryByRole } = setup(
      <DndProvider backend={HTML5Backend}>
        <ChecklistComponent
          text=""
          node={{ data: { text: "", tags: ["customisation"] } }}
        />
      </DndProvider>,
    );

    const customisationChip = queryByTestId("customisation-chip");
    const customisationButton = queryByRole("button", {
      name: /customisation/i,
    });

    expect(customisationChip).toBeInTheDocument();
    expect(customisationButton).toBeInTheDocument();
  });
});

describe("Checklist Component for a non Platform Admin", () => {
  beforeEach(() =>
    act(() =>
      setState({
        user: {
          ...mockUser,
          isPlatformAdmin: false,
        },
      }),
    ),
  );

  it("renders all tags except Customisation with none selected", async () => {
    const { getByRole, user } = setup(
      <DndProvider backend={HTML5Backend}>
        <ChecklistComponent text="" />
      </DndProvider>,
    );
    const tagSelect = getByRole("combobox", { name: /tag this component/i });

    await user.click(tagSelect);

    const optionsList = getByRole("listbox", { name: /tag this component/i });
    const options = within(optionsList).getAllByRole("option");
    const optionTexts = options.map((option) => option.textContent);

    expect(optionTexts).not.toContain(/customisation/i);
  });

  it("renders all tags with static Customisation selected", async () => {
    const { getByTestId, queryByRole } = setup(
      <DndProvider backend={HTML5Backend}>
        <ChecklistComponent
          text=""
          node={{ data: { text: "", tags: ["customisation"] } }}
        />
      </DndProvider>,
    );

    const customisationChip = getByTestId("customisation-chip");
    const customisationButton = queryByRole("button", {
      name: /customisation/i,
    });

    expect(customisationChip).toBeInTheDocument();
    expect(customisationButton).not.toBeInTheDocument();
  });
});

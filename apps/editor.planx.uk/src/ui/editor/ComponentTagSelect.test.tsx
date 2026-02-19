import { User } from "@opensystemslab/planx-core/types";
import ChecklistComponent from "@planx/components/Checklist/Editor";
import { act, within } from "@testing-library/react";
import { TAG_DISPLAY_VALUES } from "pages/FlowEditor/components/Flow/components/Tag";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { setup } from "testUtils";
import { it } from "vitest";

const { setState } = useStore;

const mockUser: Omit<User, "isPlatformAdmin"> = {
  id: 200,
  firstName: "Testy",
  lastName: "McTester",
  email: "test@email.com",
  teams: [],
  isAnalyst: false,
  defaultTeamId: null,
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
    const { getByRole, user } = await setup(
      <DndProvider backend={HTML5Backend}>
        <ChecklistComponent options={[]} />
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

  it("renders all tags with none selected", async () => {
    const { getByRole, user } = await setup(
      <DndProvider backend={HTML5Backend}>
        <ChecklistComponent options={[]} />
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
});

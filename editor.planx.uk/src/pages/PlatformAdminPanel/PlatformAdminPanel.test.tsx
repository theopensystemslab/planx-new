import { act } from "@testing-library/react";
import { FullStore, useStore } from "pages/FlowEditor/lib/store";
import { mockTeams } from "ui/shared/DataTable/mockTeams";
import { it } from "vitest";

const { getState, setState } = useStore;

let initialState: FullStore;

describe("Platform admin panel", () => {
  beforeAll(() => (initialState = getState()));

  beforeEach(() => {
    getState().setAdminPanelData(mockTeams);
  });
  afterEach(() => {
    act(() => setState(initialState));
  });

  it.todo("renders without an error");

  it.todo("is only viewable with the correct role");

  it.todo("renders a tick / cross for boolean values");
});

import { within } from "@testing-library/react";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import * as ReactNavi from "react-navi";
import { setup } from "testUtils";
import { Mocked, vi } from "vitest";

import EditorNavMenu from "./EditorNavMenu";

vi.mock("react-navi", () => ({
  useCurrentRoute: vi.fn(),
  useNavigation: () => ({ navigate: vi.fn() }),
  // Mock completed loading process
  useLoadingRoute: () => undefined,
}));

const mockNavi = ReactNavi as Mocked<typeof ReactNavi>;

let mockTeamName: string | undefined = undefined;
let mockFlowName: string | undefined = undefined;
let mockAnalyticsLink: string | undefined = undefined;
const mockGetUserRoleForCurrentTeam = vi.fn();

vi.mock("pages/FlowEditor/lib/store", async () => ({
  useStore: vi.fn(() => [
    mockTeamName,
    mockFlowName,
    mockAnalyticsLink,
    mockGetUserRoleForCurrentTeam(),
  ]),
}));

describe("globalLayoutRoutes", () => {
  beforeEach(() => {
    mockNavi.useCurrentRoute.mockReturnValue({
      url: { href: "/" },
    } as ReturnType<typeof mockNavi.useCurrentRoute>);
  });

  it("does not display for teamEditors", () => {
    mockGetUserRoleForCurrentTeam.mockReturnValue("teamEditor");

    const { queryAllByRole } = setup(<EditorNavMenu />);
    const menuItems = queryAllByRole("listitem");
    expect(menuItems).toHaveLength(0);
  });

  it("displays for platformAdmins", () => {
    mockGetUserRoleForCurrentTeam.mockReturnValue("platformAdmin");

    const { getAllByRole } = setup(<EditorNavMenu />);
    const menuItems = getAllByRole("listitem");
    expect(menuItems).toHaveLength(3);
    expect(within(menuItems[0]).getByText("Select a team")).toBeInTheDocument();
  });
});

describe("teamLayoutRoutes", () => {
  beforeEach(() => {
    mockNavi.useCurrentRoute.mockReturnValue({
      url: { href: "/test-team" },
    } as ReturnType<typeof mockNavi.useCurrentRoute>);
    mockTeamName = "test-team";
  });

  it("does not display for teamViewers", () => {
    mockGetUserRoleForCurrentTeam.mockReturnValue("teamViewer");

    const { queryAllByRole } = setup(<EditorNavMenu />);
    const menuItems = queryAllByRole("listitem");
    expect(menuItems).toHaveLength(0);
  });

  it("displays for teamEditors", () => {
    mockGetUserRoleForCurrentTeam.mockReturnValue("teamEditor");

    const { getAllByRole } = setup(<EditorNavMenu />);
    const menuItems = getAllByRole("listitem");
    expect(menuItems).toHaveLength(4);
    expect(within(menuItems[0]).getByText("Services")).toBeInTheDocument();
  });

  it("displays for platformAdmins", () => {
    mockGetUserRoleForCurrentTeam.mockReturnValue("platformAdmin");

    const { getAllByRole } = setup(<EditorNavMenu />);
    const menuItems = getAllByRole("listitem");
    expect(menuItems).toHaveLength(4);
    expect(within(menuItems[0]).getByText("Services")).toBeInTheDocument();
  });
});

describe("flowLayoutRoutes", () => {
  beforeEach(() => {
    mockNavi.useCurrentRoute.mockReturnValue({
      url: { href: "/test-team/test-flow" },
    } as ReturnType<typeof mockNavi.useCurrentRoute>);
    mockTeamName = "test-team";
    mockFlowName = "test-flow";
  });

  it("only displays the 'about this service' route for teamViewers", () => {
    mockGetUserRoleForCurrentTeam.mockReturnValue("teamViewer");

    const { queryAllByRole } = setup(<EditorNavMenu />);
    const menuItems = queryAllByRole("listitem");
    expect(menuItems).toHaveLength(2); // Flow and About this service
  });

  it("displays for teamEditors", () => {
    mockGetUserRoleForCurrentTeam.mockReturnValue("teamEditor");

    const { getAllByRole, getByLabelText } = setup(<EditorNavMenu />);
    const menuItems = getAllByRole("listitem");
    expect(menuItems).toHaveLength(6);
    expect(getByLabelText("Submissions log")).toBeInTheDocument();
  });

  it("displays for platformAdmins", () => {
    mockGetUserRoleForCurrentTeam.mockReturnValue("platformAdmin");

    const { getAllByRole, getByLabelText } = setup(<EditorNavMenu />);
    const menuItems = getAllByRole("listitem");
    expect(menuItems).toHaveLength(6);
    expect(getByLabelText("Submissions log")).toBeInTheDocument();
  });
});

describe("flowAnalyticsRoute", () => {
  beforeEach(() => {
    mockNavi.useCurrentRoute.mockReturnValue({
      url: { href: "/test-team/test-flow" },
    } as ReturnType<typeof mockNavi.useCurrentRoute>);
    mockTeamName = "test-team";
    mockFlowName = "test-flow";
    mockGetUserRoleForCurrentTeam.mockReturnValue("teamEditor");
  });

  it("is disabled without an analytics link", () => {
    const { getByRole } = setup(<EditorNavMenu />);
    expect(getByRole("button", { name: /Analytics/ })).toBeDisabled();
  });

  it("is enabled with an analytics link", () => {
    mockAnalyticsLink = "https://link-to-metabase";

    const { getByRole } = setup(<EditorNavMenu />);
    expect(getByRole("button", { name: /Analytics/ })).not.toBeDisabled();
  });
});

describe("layout", () => {
  it("displays in a full mode on global routes", () => {
    mockNavi.useCurrentRoute.mockReturnValue({
      url: { href: "/" },
    } as ReturnType<typeof mockNavi.useCurrentRoute>);
    mockGetUserRoleForCurrentTeam.mockReturnValue("platformAdmin");

    const { queryAllByRole, queryByLabelText } = setup(<EditorNavMenu />);
    const menuItems = queryAllByRole("listitem");

    // Tooltip not present
    expect(queryByLabelText("Select a team")).not.toBeInTheDocument();

    // Full text present
    expect(within(menuItems[0]).getByText("Select a team")).toBeInTheDocument();
  });

  it("displays in a full mode on team routes", () => {
    mockNavi.useCurrentRoute.mockReturnValue({
      url: { href: "/test-team" },
    } as ReturnType<typeof mockNavi.useCurrentRoute>);
    mockGetUserRoleForCurrentTeam.mockReturnValue("platformAdmin");
    mockTeamName = "test-team";

    const { queryAllByRole, queryByLabelText } = setup(<EditorNavMenu />);
    const menuItems = queryAllByRole("listitem");

    // Tooltip not present
    expect(queryByLabelText("Services")).not.toBeInTheDocument();

    // Full text present
    expect(within(menuItems[0]).getByText("Services")).toBeInTheDocument();
  });

  it("displays in a compact mode on flow routes", () => {
    mockNavi.useCurrentRoute.mockReturnValue({
      url: { href: "/test-team/test-flow" },
    } as ReturnType<typeof mockNavi.useCurrentRoute>);
    mockGetUserRoleForCurrentTeam.mockReturnValue("platformAdmin");
    mockTeamName = "test-team";
    mockFlowName = "test-flow";

    const { queryAllByRole, getByLabelText } = setup(<EditorNavMenu />);
    const menuItems = queryAllByRole("listitem");

    // Tooltip  present
    expect(getByLabelText("Submissions log")).toBeInTheDocument();

    // Full text present
    expect(
      within(menuItems[0]).queryByText("Submissions log"),
    ).not.toBeInTheDocument();
  });
});

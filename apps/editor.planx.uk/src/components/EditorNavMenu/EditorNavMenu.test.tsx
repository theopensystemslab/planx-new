import * as TanStackRouter from "@tanstack/react-router";
import { within } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";

import EditorNavMenu from "./EditorNavMenu";

vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual("@tanstack/react-router");
  return {
    ...actual,
    useLocation: vi.fn(),
    useNavigate: vi.fn(() => vi.fn()),
    useRouter: vi.fn(() => ({ state: { isLoading: false } })),
  };
});

const mockUseLocation = vi.mocked(TanStackRouter.useLocation);

let mockTeamName: string | undefined = undefined;
let mockFlowName: string | undefined = undefined;
let mockAnalyticsLink: string | undefined = undefined;
const mockGetUserRoleForCurrentTeam = vi.fn();
const mockGetTeam = vi.fn();
const mockSetIsNavMenuVisible = vi.fn();

vi.mock("pages/FlowEditor/lib/store", async () => ({
  useStore: vi.fn((selector) =>
    selector({
      teamSlug: mockTeamName,
      flowSlug: mockFlowName,
      flowAnalyticsLink: mockAnalyticsLink,
      getUserRoleForCurrentTeam: mockGetUserRoleForCurrentTeam,
      getTeam: mockGetTeam,
      setIsNavMenuVisible: mockSetIsNavMenuVisible,
    }),
  ),
  getState: () => ({
    teamSlug: mockTeamName,
    teamAnalyticsLink: mockAnalyticsLink,
  }),
}));

describe("globalLayoutRoutes", () => {
  beforeEach(() => {
    mockUseLocation.mockReturnValue({
      pathname: "/",
      search: {},
      hash: "",
      href: "/",
      state: { __TSR_index: 0 },
      searchStr: "",
      publicHref: "",
      external: false,
    });
  });

  it("hides menu for teamEditors (only 1 accessible route)", async () => {
    mockGetUserRoleForCurrentTeam.mockReturnValue("teamEditor");

    const { queryAllByRole } = await setup(<EditorNavMenu />);
    const menuItems = queryAllByRole("listitem");
    expect(menuItems).toHaveLength(0);
  });

  it("displays for platformAdmins", async () => {
    mockGetUserRoleForCurrentTeam.mockReturnValue("platformAdmin");

    const { getAllByRole } = await setup(<EditorNavMenu />);
    const menuItems = getAllByRole("listitem");
    expect(menuItems).toHaveLength(3);
    expect(within(menuItems[0]).getByText("Select a team")).toBeInTheDocument();
  });
});

describe("teamLayoutRoutes", () => {
  beforeEach(() => {
    mockUseLocation.mockReturnValue({
      pathname: "/test-team",
      search: {},
      hash: "",
      href: "/test-team",
      state: { __TSR_index: 0 },
      searchStr: "",
      publicHref: "",
      external: false,
    });
    mockTeamName = "test-team";
    mockGetTeam.mockReturnValue({ settings: { referenceCode: null } });
  });

  it("only displays the external link routes for teamViewers", async () => {
    mockGetUserRoleForCurrentTeam.mockReturnValue("teamViewer");

    const { queryAllByRole } = await setup(<EditorNavMenu />);
    const menuItems = queryAllByRole("listitem");
    expect(menuItems).toHaveLength(6);
    expect(within(menuItems[0]).getByText("Flows")).toBeInTheDocument();
    expect(within(menuItems[1]).getByText("Planning Data")).toBeInTheDocument();
    expect(
      within(menuItems[2]).getByText("Local Planning Services"),
    ).toBeInTheDocument();
  });

  it("displays for teamEditors", async () => {
    mockGetUserRoleForCurrentTeam.mockReturnValue("teamEditor");

    const { getAllByRole } = await setup(<EditorNavMenu />);
    const menuItems = getAllByRole("listitem");
    expect(menuItems).toHaveLength(11);
    expect(within(menuItems[0]).getByText("Flows")).toBeInTheDocument();
  });

  it("displays for platformAdmins", async () => {
    mockGetUserRoleForCurrentTeam.mockReturnValue("platformAdmin");

    const { getAllByRole } = await setup(<EditorNavMenu />);
    const menuItems = getAllByRole("listitem");
    expect(menuItems).toHaveLength(11);
    expect(within(menuItems[0]).getByText("Flows")).toBeInTheDocument();
    expect(within(menuItems[1]).getByText("Team settings")).toBeInTheDocument();
  });

  it("displays subtitles for sections", async () => {
    mockGetUserRoleForCurrentTeam.mockReturnValue("platformAdmin");

    const { getByText } = await setup(<EditorNavMenu />);
    expect(getByText("Settings")).toBeInTheDocument();
    expect(getByText("Data")).toBeInTheDocument();
    expect(getByText("Documentation")).toBeInTheDocument();
  });
});

describe("teamPlanningDataRoute", () => {
  beforeEach(() => {
    mockUseLocation.mockReturnValue({
      pathname: "/test-team",
      search: {},
      hash: "",
      href: "/test-team",
      state: { __TSR_index: 0 },
      searchStr: "",
      publicHref: "",
      external: false,
    });
    mockTeamName = "test-team";
  });

  it("is disabled without a reference code", async () => {
    mockGetTeam.mockReturnValue({ settings: { referenceCode: null } });

    const { getByRole } = await setup(<EditorNavMenu />);
    expect(getByRole("button", { name: /Planning Data/ })).toBeDisabled();
  });

  it("is enabled with a reference code", async () => {
    mockGetTeam.mockReturnValue({ settings: { referenceCode: "TEST" } });

    const { getByRole } = await setup(<EditorNavMenu />);
    expect(getByRole("button", { name: /Planning Data/ })).toBeEnabled();
  });
});

describe("flowLayoutRoutes", () => {
  beforeEach(() => {
    mockUseLocation.mockReturnValue({
      pathname: "/test-team/test-flow",
      search: {},
      hash: "",
      href: "/test-team/test-flow",
      state: { __TSR_index: 0 },
      searchStr: "",
      publicHref: "",
      external: false,
    });
    mockTeamName = "test-team";
    mockFlowName = "test-flow";
  });

  it("displays for teamEditors", async () => {
    mockGetUserRoleForCurrentTeam.mockReturnValue("teamEditor");

    const { getAllByRole, getByLabelText } = await setup(<EditorNavMenu />);
    const menuItems = getAllByRole("listitem");
    expect(menuItems).toHaveLength(5);
    expect(getByLabelText("Submissions")).toBeInTheDocument();
    expect(getByLabelText("Feedback")).toBeInTheDocument();
  });

  it("displays for platformAdmins", async () => {
    mockGetUserRoleForCurrentTeam.mockReturnValue("platformAdmin");

    const { getAllByRole, getByLabelText } = await setup(<EditorNavMenu />);
    const menuItems = getAllByRole("listitem");
    expect(menuItems).toHaveLength(5);
    expect(getByLabelText("Submissions")).toBeInTheDocument();
    expect(getByLabelText("Feedback")).toBeInTheDocument();
  });
});

describe("flowAnalyticsRoute", () => {
  beforeEach(() => {
    mockUseLocation.mockReturnValue({
      pathname: "/test-team/test-flow",
      search: {},
      hash: "",
      href: "/test-team/test-flow",
      state: { __TSR_index: 0 },
      searchStr: "",
      publicHref: "",
      external: false,
    });
    mockTeamName = "test-team";
    mockFlowName = "test-flow";
    mockGetUserRoleForCurrentTeam.mockReturnValue("teamEditor");
  });

  it("is disabled without an analytics link", async () => {
    const { getByRole } = await setup(<EditorNavMenu />);
    expect(getByRole("button", { name: /Analytics/ })).toBeDisabled();
  });

  it("is enabled with an analytics link", async () => {
    mockAnalyticsLink = "https://link-to-metabase";

    const { getByRole } = await setup(<EditorNavMenu />);
    expect(getByRole("button", { name: /Analytics/ })).toBeEnabled();
  });
});

describe("layout", () => {
  it("displays in a full mode on global routes", async () => {
    mockUseLocation.mockReturnValue({
      pathname: "/",
      search: {},
      hash: "",
      href: "/",
      state: { __TSR_index: 0 },
      searchStr: "",
      publicHref: "",
      external: false,
    });
    mockGetUserRoleForCurrentTeam.mockReturnValue("platformAdmin");

    const { queryAllByRole, queryByLabelText } = await setup(<EditorNavMenu />);
    const menuItems = queryAllByRole("listitem");

    // Tooltip not present
    expect(queryByLabelText("Select a team")).not.toBeInTheDocument();

    // Full text present
    expect(within(menuItems[0]).getByText("Select a team")).toBeInTheDocument();
  });

  it("displays in a full mode on team routes", async () => {
    mockUseLocation.mockReturnValue({
      pathname: "/test-team",
      search: {},
      hash: "",
      href: "/test-team",
      state: { __TSR_index: 0 },
      searchStr: "",
      publicHref: "",
      external: false,
    });
    mockGetUserRoleForCurrentTeam.mockReturnValue("platformAdmin");
    mockTeamName = "test-team";
    mockGetTeam.mockReturnValue({ settings: { referenceCode: null } });

    const { queryAllByRole, queryByLabelText } = await setup(<EditorNavMenu />);
    const menuItems = queryAllByRole("listitem");

    // Tooltip not present
    expect(queryByLabelText("Flows")).not.toBeInTheDocument();

    // Full text present
    expect(within(menuItems[0]).getByText("Flows")).toBeInTheDocument();
  });

  it("displays in a compact mode on flow routes", async () => {
    mockUseLocation.mockReturnValue({
      pathname: "/test-team/test-flow",
      search: {},
      hash: "",
      href: "/test-team/test-flow",
      state: { __TSR_index: 0 },
      searchStr: "",
      publicHref: "",
      external: false,
    });
    mockGetUserRoleForCurrentTeam.mockReturnValue("platformAdmin");
    mockTeamName = "test-team";
    mockFlowName = "test-flow";

    const { queryAllByRole, getByLabelText } = await setup(<EditorNavMenu />);
    const menuItems = queryAllByRole("listitem");

    // Tooltip  present
    expect(getByLabelText("Submissions")).toBeInTheDocument();

    // Full text present
    expect(
      within(menuItems[0]).queryByText("Submissions"),
    ).not.toBeInTheDocument();
  });
});

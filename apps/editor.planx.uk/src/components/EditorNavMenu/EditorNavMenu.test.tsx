import * as TanStackRouter from "@tanstack/react-router";
import { within } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";

import EditorNavMenu from "./EditorNavMenu";

vi.mock("@tanstack/react-router", () => ({
  useLocation: vi.fn(),
  useNavigate: vi.fn(() => vi.fn()),
  useRouter: vi.fn(() => ({ state: { isLoading: false } })),
}));

const mockUseLocation = vi.mocked(TanStackRouter.useLocation);

let mockTeamName: string | undefined = undefined;
let mockFlowName: string | undefined = undefined;
let mockAnalyticsLink: string | undefined = undefined;
const mockGetUserRoleForCurrentTeam = vi.fn();
const mockGetTeam = vi.fn();

vi.mock("pages/FlowEditor/lib/store", async () => ({
  useStore: vi.fn((selector) => {
    const state = {
      teamSlug: mockTeamName,
      flowSlug: mockFlowName,
      flowAnalyticsLink: mockAnalyticsLink,
      getUserRoleForCurrentTeam: mockGetUserRoleForCurrentTeam,
      getTeam: mockGetTeam,
    };

    return selector
      ? selector(state)
      : [
          mockTeamName,
          mockFlowName,
          mockAnalyticsLink,
          mockGetUserRoleForCurrentTeam(),
          mockGetTeam(),
        ];
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
    });
  });

  it("displays for teamEditors", () => {
    mockGetUserRoleForCurrentTeam.mockReturnValue("teamEditor");

    const { queryAllByRole } = setup(<EditorNavMenu />);
    const menuItems = queryAllByRole("listitem");
    expect(menuItems).toHaveLength(4);
  });

  it("displays for platformAdmins", () => {
    mockGetUserRoleForCurrentTeam.mockReturnValue("platformAdmin");

    const { getAllByRole } = setup(<EditorNavMenu />);
    const menuItems = getAllByRole("listitem");
    expect(menuItems).toHaveLength(6);
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
    });
    mockTeamName = "test-team";
    mockGetTeam.mockReturnValue({ settings: { referenceCode: null } });
  });

  it("only displays the 'planning data' route for teamViewers", () => {
    mockGetUserRoleForCurrentTeam.mockReturnValue("teamViewer");

    const { queryAllByRole } = setup(<EditorNavMenu />);
    const menuItems = queryAllByRole("listitem");
    expect(menuItems).toHaveLength(2);
    expect(within(menuItems[0]).getByText("Flows")).toBeInTheDocument();
    expect(
      within(menuItems[1]).getByText("Planning Data unavailable"),
    ).toBeInTheDocument();
  });

  it("displays for teamEditors", () => {
    mockGetUserRoleForCurrentTeam.mockReturnValue("teamEditor");

    const { getAllByRole } = setup(<EditorNavMenu />);
    const menuItems = getAllByRole("listitem");
    expect(menuItems).toHaveLength(8);
    expect(within(menuItems[0]).getByText("Flows")).toBeInTheDocument();
  });

  it("displays for platformAdmins", () => {
    mockGetUserRoleForCurrentTeam.mockReturnValue("platformAdmin");

    const { getAllByRole } = setup(<EditorNavMenu />);
    const menuItems = getAllByRole("listitem");
    expect(menuItems).toHaveLength(8);
    expect(within(menuItems[0]).getByText("Flows")).toBeInTheDocument();
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
    });
    mockTeamName = "test-team";
  });

  it("is disabled without a reference code", () => {
    mockGetTeam.mockReturnValue({ settings: { referenceCode: null } });

    const { getByRole } = setup(<EditorNavMenu />);
    expect(getByRole("button", { name: /Planning Data/ })).toBeDisabled();
  });

  it("is enabled with a reference code", () => {
    mockGetTeam.mockReturnValue({ settings: { referenceCode: "TEST" } });

    const { getByRole } = setup(<EditorNavMenu />);
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
    });
    mockTeamName = "test-team";
    mockFlowName = "test-flow";
  });

  it("only displays the 'about this service' route for teamViewers", () => {
    mockGetUserRoleForCurrentTeam.mockReturnValue("teamViewer");

    const { queryAllByRole } = setup(<EditorNavMenu />);
    const menuItems = queryAllByRole("listitem");
    expect(menuItems).toHaveLength(2); // Flow and About this flow
  });

  it("displays for teamEditors", () => {
    mockGetUserRoleForCurrentTeam.mockReturnValue("teamEditor");

    const { getAllByRole, getByLabelText } = setup(<EditorNavMenu />);
    const menuItems = getAllByRole("listitem");
    expect(menuItems).toHaveLength(6);
    expect(getByLabelText("Submissions")).toBeInTheDocument();
    expect(getByLabelText("Feedback")).toBeInTheDocument();
  });

  it("displays for platformAdmins", () => {
    mockGetUserRoleForCurrentTeam.mockReturnValue("platformAdmin");

    const { getAllByRole, getByLabelText } = setup(<EditorNavMenu />);
    const menuItems = getAllByRole("listitem");
    expect(menuItems).toHaveLength(6);
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
    });
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
    expect(getByRole("button", { name: /Analytics/ })).toBeEnabled();
  });
});

describe("layout", () => {
  it("displays in a full mode on global routes", () => {
    mockUseLocation.mockReturnValue({
      pathname: "/",
      search: {},
      hash: "",
      href: "/",
      state: { __TSR_index: 0 },
      searchStr: "",
    });
    mockGetUserRoleForCurrentTeam.mockReturnValue("platformAdmin");

    const { queryAllByRole, queryByLabelText } = setup(<EditorNavMenu />);
    const menuItems = queryAllByRole("listitem");

    // Tooltip not present
    expect(queryByLabelText("Select a team")).not.toBeInTheDocument();

    // Full text present
    expect(within(menuItems[0]).getByText("Select a team")).toBeInTheDocument();
  });

  it("displays in a full mode on team routes", () => {
    mockUseLocation.mockReturnValue({
      pathname: "/test-team",
      search: {},
      hash: "",
      href: "/test-team",
      state: { __TSR_index: 0 },
      searchStr: "",
    });
    mockGetUserRoleForCurrentTeam.mockReturnValue("platformAdmin");
    mockTeamName = "test-team";

    const { queryAllByRole, queryByLabelText } = setup(<EditorNavMenu />);
    const menuItems = queryAllByRole("listitem");

    // Tooltip not present
    expect(queryByLabelText("Flows")).not.toBeInTheDocument();

    // Full text present
    expect(within(menuItems[0]).getByText("Flows")).toBeInTheDocument();
  });

  it("displays in a compact mode on flow routes", () => {
    mockUseLocation.mockReturnValue({
      pathname: "/test-team/test-flow",
      search: {},
      hash: "",
      href: "/test-team/test-flow",
      state: { __TSR_index: 0 },
      searchStr: "",
    });
    mockGetUserRoleForCurrentTeam.mockReturnValue("platformAdmin");
    mockTeamName = "test-team";
    mockFlowName = "test-flow";

    const { queryAllByRole, getByLabelText } = setup(<EditorNavMenu />);
    const menuItems = queryAllByRole("listitem");

    // Tooltip  present
    expect(getByLabelText("Submissions")).toBeInTheDocument();

    // Full text present
    expect(
      within(menuItems[0]).queryByText("Submissions"),
    ).not.toBeInTheDocument();
  });
});

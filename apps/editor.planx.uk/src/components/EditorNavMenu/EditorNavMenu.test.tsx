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
    useLoaderData: vi.fn(() => ({ teams: [] })),
  };
});

const mockUseLocation = vi.mocked(TanStackRouter.useLocation);

let mockTeamName: string | undefined = undefined;
let mockFlowName: string | undefined = undefined;
let mockAnalyticsLink: string | undefined = undefined;
const mockGetUserRoleForCurrentTeam = vi.fn();
const mockGetTeam = vi.fn();
const mockSetIsNavMenuVisible = vi.fn();

const mockUser = {
  firstName: "Test",
  lastName: "User",
  isPlatformAdmin: false,
  isAnalyst: false,
  teams: [],
  id: 123,
  email: "test@example.com",
  defaultTeamId: 1,
};

vi.mock("pages/FlowEditor/lib/store", async () => ({
  useStore: vi.fn((selector) =>
    selector({
      teamSlug: mockTeamName,
      flowSlug: mockFlowName,
      flowAnalyticsLink: mockAnalyticsLink,
      getUserRoleForCurrentTeam: mockGetUserRoleForCurrentTeam,
      getUserRole: vi.fn(),
      getTeam: mockGetTeam,
      setIsNavMenuVisible: mockSetIsNavMenuVisible,
      user: mockUser,
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

  it("shows menu for teamEditors (only 1 accessible route)", async () => {
    mockGetUserRoleForCurrentTeam.mockReturnValue("teamEditor");

    const { getAllByRole } = await setup(<EditorNavMenu />);
    const menuItems = getAllByRole("listitem");
    expect(menuItems).toHaveLength(1);
    expect(within(menuItems[0]).getByText("Select a team")).toBeInTheDocument();
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

    const { queryAllByRole, getByRole, user } = await setup(<EditorNavMenu />);
    expect(queryAllByRole("listitem")).toHaveLength(3);
    expect(queryAllByRole("listitem")[0]).toHaveTextContent("Flows");

    await user.click(getByRole("button", { name: "Data" }));
    expect(getByRole("button", { name: /Planning Data/ })).toBeInTheDocument();
    expect(
      getByRole("button", { name: /Local Planning Services/ }),
    ).toBeInTheDocument();
  });

  it("displays for teamEditors", async () => {
    mockGetUserRoleForCurrentTeam.mockReturnValue("teamEditor");

    const { getAllByRole } = await setup(<EditorNavMenu />);
    const menuItems = getAllByRole("listitem");
    expect(menuItems).toHaveLength(4);
    expect(within(menuItems[0]).getByText("Flows")).toBeInTheDocument();
  });

  it("displays for platformAdmins", async () => {
    mockGetUserRoleForCurrentTeam.mockReturnValue("platformAdmin");

    const { getAllByRole, getByRole, user } = await setup(<EditorNavMenu />);
    expect(getAllByRole("listitem")).toHaveLength(4);
    expect(getAllByRole("listitem")[0]).toHaveTextContent("Flows");

    await user.click(getByRole("button", { name: "Settings" }));
    expect(getByRole("button", { name: /Team settings/ })).toBeInTheDocument();
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

    const { getByRole, user } = await setup(<EditorNavMenu />);
    await user.click(getByRole("button", { name: "Data" }));
    expect(getByRole("button", { name: /Planning Data/ })).toBeDisabled();
  });

  it("is enabled with a reference code", async () => {
    mockGetTeam.mockReturnValue({ settings: { referenceCode: "TEST" } });

    const { getByRole, user } = await setup(<EditorNavMenu />);
    await user.click(getByRole("button", { name: "Data" }));
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
    expect(getByLabelText("Analytics")).toBeInTheDocument();
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

describe("account menu", () => {
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

  it("displays avatar initials and toggle button", async () => {
    const { getByText, getByLabelText } = await setup(<EditorNavMenu />);
    expect(getByText("TU")).toBeInTheDocument();
    expect(getByLabelText("Toggle Menu")).toBeInTheDocument();
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

    const { queryAllByRole, queryByLabelText, getByText } = await setup(
      <EditorNavMenu />,
    );
    const menuItems = queryAllByRole("listitem");

    // Tooltip not present
    expect(queryByLabelText("Select a team")).not.toBeInTheDocument();

    // Full text present
    expect(within(menuItems[0]).getByText("Select a team")).toBeInTheDocument();

    // Logo displays full text in non-compact mode
    expect(getByText("Plan✕")).toBeInTheDocument();
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

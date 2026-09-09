import * as TanStackRouter from "@tanstack/react-router";
import { within } from "@testing-library/react";
import { setup } from "test/utils";
import { vi } from "vitest";

import EditorNavMenu from "./EditorNavMenu";

let mockSearch: Record<string, unknown> = {};

vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual("@tanstack/react-router");
  return {
    ...actual,
    useLocation: vi.fn(),
    useNavigate: vi.fn(() => vi.fn()),
    useParams: vi.fn(() => ({})),
    useLoaderData: vi.fn(() => ({ teams: [] })),
    useSearch: vi.fn((opts?: { select?: (s: unknown) => unknown }) =>
      opts?.select ? opts.select(mockSearch) : mockSearch,
    ),
  };
});

// Stub the embed so jsdom doesn't try to load the real notion.site iframe
vi.mock("ui/editor/NotionEmbed", async () => {
  const React = await import("react");
  return {
    default: ({ title }: { title: string }) =>
      React.createElement("iframe", { title }),
  };
});

const mockUseLocation = vi.mocked(TanStackRouter.useLocation);

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
      getUserRoleForCurrentTeam: mockGetUserRoleForCurrentTeam,
      getUserRole: vi.fn(),
      getTeam: mockGetTeam,
      setIsNavMenuVisible: mockSetIsNavMenuVisible,
      user: mockUser,
    }),
  ),
}));

vi.mock("hooks/analyticsLinks/useFlowAnalyticsLink", () => ({
  useFlowAnalyticsLink: vi.fn(() => mockAnalyticsLink),
}));

/**
 * Helper to manage route context across test setups
 */
const setRouteContext = (
  pathname: string,
  routeIds: string[],
  params: Record<string, string> = {},
) => {
  mockUseLocation.mockReturnValue({
    pathname,
  } as TanStackRouter.ParsedLocation);

  vi.spyOn(TanStackRouter, "useMatches").mockReturnValue(
    routeIds.map(
      (id) =>
        ({ routeId: id }) as TanStackRouter.RouteMatch<
          unknown,
          unknown,
          unknown,
          unknown,
          unknown,
          unknown,
          unknown
        >,
    ),
  );
  vi.spyOn(TanStackRouter, "useParams").mockReturnValue(params);
};

afterEach(() => {
  vi.clearAllMocks();
  mockAnalyticsLink = undefined;
  mockSearch = {};
});

describe("globalLayoutRoutes", () => {
  beforeEach(() => {
    setRouteContext("/", ["app"]);
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
    expect(menuItems).toHaveLength(4);
    expect(within(menuItems[0]).getByText("Select a team")).toBeInTheDocument();
  });
});

describe("teamLayoutRoutes", () => {
  beforeEach(() => {
    setRouteContext("/test-team", ["app", "app/$team"], { team: "test-team" });
    mockGetTeam.mockReturnValue({ settings: { referenceCode: null } });
  });

  it("only displays the external link routes for teamViewers", async () => {
    mockGetUserRoleForCurrentTeam.mockReturnValue("teamViewer");

    const { queryAllByRole, getByRole, user } = await setup(<EditorNavMenu />);
    expect(queryAllByRole("listitem")).toHaveLength(4);
    expect(queryAllByRole("listitem")[0]).toHaveTextContent("Dashboard");

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
    expect(menuItems).toHaveLength(5);
    expect(within(menuItems[0]).getByText("Dashboard")).toBeInTheDocument();
  });

  it("displays for platformAdmins", async () => {
    mockGetUserRoleForCurrentTeam.mockReturnValue("platformAdmin");

    const { getAllByRole, getByRole, user } = await setup(<EditorNavMenu />);
    expect(getAllByRole("listitem")).toHaveLength(5);
    expect(getAllByRole("listitem")[0]).toHaveTextContent("Dashboard");

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

  it("opens a doc item via the ?guide search param, not by navigating pages", async () => {
    const mockNavigate = vi.fn();
    vi.mocked(TanStackRouter.useNavigate).mockReturnValue(mockNavigate);
    mockGetUserRoleForCurrentTeam.mockReturnValue("teamEditor");

    const { getByRole, queryByRole, user } = await setup(<EditorNavMenu />);
    expect(queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(getByRole("button", { name: "Documentation" }));
    await user.click(getByRole("button", { name: "Resources" }));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    const [arg] = mockNavigate.mock.calls[0];
    expect(arg.to).toBe(".");
    // search is an updater that only sets `guide`, leaving the rest of the URL
    expect(arg.search({ existing: 1 })).toEqual({
      existing: 1,
      guide: "resources",
    });
  });

  it("shows the Notion dialog when ?guide is set", async () => {
    const mockNavigate = vi.fn();
    vi.mocked(TanStackRouter.useNavigate).mockReturnValue(mockNavigate);
    mockSearch = { guide: "resources" };
    mockGetUserRoleForCurrentTeam.mockReturnValue("teamEditor");

    const { getByRole, user } = await setup(<EditorNavMenu />);

    const dialog = getByRole("dialog");
    expect(within(dialog).getByTitle("Resources")).toBeInTheDocument();

    // Closing clears the guide param
    await user.click(within(dialog).getByRole("button", { name: "Close" }));
    const [arg] = mockNavigate.mock.calls.at(-1)!;
    expect(arg.search({ guide: "resources", other: 2 })).toEqual({
      other: 2,
      guide: undefined,
    });
  });
});

describe("teamPlanningDataRoute", () => {
  beforeEach(() => {
    setRouteContext("/test-team", ["app", "app/$team"], { team: "test-team" });
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
    setRouteContext(
      "/test-team/test-flow",
      ["app", "app/$team", "app/$team/$flow"],
      {
        team: "test-team",
        flow: "test-flow",
      },
    );
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
    expect(getByLabelText(/Analytics/)).toBeInTheDocument();
  });
});

describe("flowAnalyticsRoute", () => {
  beforeEach(() => {
    setRouteContext(
      "/test-team/test-flow",
      ["app", "app/$team", "app/$team/$flow"],
      {
        team: "test-team",
        flow: "test-flow",
      },
    );
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
    setRouteContext("/test-team/test-flow", ["app"], {
      team: "test-team",
      flow: "test-flow",
    });
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
    setRouteContext("/", ["app"]);
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
    setRouteContext("/test-team", ["app", "app/$team"], { team: "test-team" });
    mockGetUserRoleForCurrentTeam.mockReturnValue("platformAdmin");
    mockGetTeam.mockReturnValue({ settings: { referenceCode: null } });

    const { queryAllByRole, queryByLabelText } = await setup(<EditorNavMenu />);
    const menuItems = queryAllByRole("listitem");

    // Tooltip not present
    expect(queryByLabelText("Dashboard")).not.toBeInTheDocument();

    // Full text present
    expect(within(menuItems[0]).getByText("Dashboard")).toBeInTheDocument();
  });

  it("displays in a compact mode on flow routes", async () => {
    setRouteContext(
      "/test-team/test-flow",
      ["app", "app/$team", "app/$team/$flow"],
      {
        team: "test-team",
        flow: "test-flow",
      },
    );
    mockGetUserRoleForCurrentTeam.mockReturnValue("platformAdmin");

    const { queryAllByRole, getByLabelText } = await setup(<EditorNavMenu />);
    const menuItems = queryAllByRole("listitem");

    // Tooltip present
    expect(getByLabelText("Submissions")).toBeInTheDocument();

    // Full text present
    expect(
      within(menuItems[0]).queryByText("Submissions"),
    ).not.toBeInTheDocument();
  });
});

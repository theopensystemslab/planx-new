import type { Role } from "@opensystemslab/planx-core/types";
import { isRedirect } from "@tanstack/react-router";
import { graphql, HttpResponse } from "msw";
import { useStore } from "pages/FlowEditor/lib/store";
import server from "test/mockServer";
import { mockUserWithRole } from "test/mockUser";

import { Route as DashboardRoute } from "./dashboard";
import { Route as TeamRoute } from "./route";
import { Route as SettingsRoute } from "./settings/route";

const TEAM_SLUG = "test-team";

const { getState, setState } = useStore;
const initialState = getState();

/**
 * Run the $team route's beforeLoad, as the router would on navigation
 * Returns the context it provides to child routes
 */
const loadTeamRoute = async (role: Role, userTeamSlug = TEAM_SLUG) => {
  const user = mockUserWithRole(role, userTeamSlug);

  // Mimic a cold page load - the user is authenticated, but FlowsLayout hasn't yet mounted to call setTeam()
  // A JWT is required, or the Apollo auth link waits for authentication
  setState({ user, jwt: "test-jwt", teamSlug: "" });

  const beforeLoad = TeamRoute.options.beforeLoad!;
  const teamContext = await beforeLoad({
    params: { team: TEAM_SLUG },
    context: { user },
  } as unknown as Parameters<typeof beforeLoad>[0]);

  return { user, ...teamContext };
};

type TeamContext = Awaited<ReturnType<typeof loadTeamRoute>>;

type GuardBeforeLoad = (args: {
  params: { team: string };
  context: TeamContext;
}) => unknown;

const runGuard = (
  route: typeof DashboardRoute | typeof SettingsRoute,
  context: TeamContext,
) => {
  const beforeLoad = route.options.beforeLoad as unknown as GuardBeforeLoad;
  return () => beforeLoad({ params: { team: TEAM_SLUG }, context });
};

beforeEach(() => {
  server.use(
    graphql.query("GetTeamBySlug", () =>
      HttpResponse.json({
        data: {
          teams: [{ id: 1, name: "Test team", slug: TEAM_SLUG, flows: [] }],
        },
      }),
    ),
  );
});

afterEach(() => setState(initialState));

describe("$team route context", () => {
  it("resolves the user's role from the route param, not the store", async () => {
    const context = await loadTeamRoute("teamEditor");

    expect(getState().teamSlug).toBe("");
    expect(context.role).toBe("teamEditor");
  });
});

describe("dashboard route guard on a cold page load", () => {
  it.each<Role>(["platformAdmin", "teamAdmin", "teamEditor", "teamViewer"])(
    "allows a %s",
    async (role) => {
      const context = await loadTeamRoute(role);
      expect(runGuard(DashboardRoute, context)).not.toThrow();
    },
  );

  it("allows a member of another team to view, as a teamViewer", async () => {
    const context = await loadTeamRoute("teamEditor", "another-team");

    expect(context.role).toBe("teamViewer");
    expect(runGuard(DashboardRoute, context)).not.toThrow();
  });

  it("redirects an analyst to flows", async () => {
    const context = await loadTeamRoute("analyst");

    let error: unknown;
    try {
      runGuard(DashboardRoute, context)();
    } catch (e) {
      error = e;
    }

    expect(isRedirect(error)).toBe(true);
  });
});

describe("settings route guard on a cold page load", () => {
  it.each<Role>(["platformAdmin", "teamAdmin", "teamEditor"])(
    "allows a %s",
    async (role) => {
      const context = await loadTeamRoute(role);
      expect(runGuard(SettingsRoute, context)).not.toThrow();
    },
  );

  it.each<Role>(["teamViewer", "analyst"])("blocks a %s", async (role) => {
    const context = await loadTeamRoute(role);

    expect(runGuard(SettingsRoute, context)).toThrow(
      expect.objectContaining({ isNotFound: true }),
    );
  });
});

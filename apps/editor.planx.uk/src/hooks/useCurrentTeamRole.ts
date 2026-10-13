import type { Role } from "@opensystemslab/planx-core/types";
import { useMatch } from "@tanstack/react-router";
import { useStore } from "pages/FlowEditor/lib/store";
import { getUserRoleForTeam } from "pages/FlowEditor/lib/store/user";

/**
 * Role of the current user, for the team in the current route
 *
 * Reads the role resolved by the $team route's beforeLoad (not the store's teamSlug) so it's
 * correct on first render and immediately after switching teams
 *
 * Longer term, we should retire the teamStore (see ADR #11)
 *
 * Docs: https://tanstack.com/router/latest/docs/framework/react/how-to/setup-rbac
 */
export const useCurrentTeamRole = (): Role | undefined => {
  const teamRole = useMatch({
    from: "/_authenticated/app/$team",
    shouldThrow: false,
    select: (match) => match.context.role,
  });
  const user = useStore((state) => state.user);

  // Outside of a team, only global roles (e.g. platformAdmin, analyst) apply
  return teamRole ?? getUserRoleForTeam(user, undefined);
};

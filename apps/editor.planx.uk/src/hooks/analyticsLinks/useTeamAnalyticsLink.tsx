import { useStore } from "pages/FlowEditor/lib/store";

const DASHBOARD_ID = "74337c9d-389d-4cb1-a65a-ad7e16428abf";
const TAB = "641-key-figures";
const IS_PROD = import.meta.env.VITE_APP_ENV === "production";

/**
 * Returns the Metabase analytics link for the current team
 */
export const useTeamAnalyticsLink = () => {
  const teamSlug = useStore((state) => state.teamSlug);

  // Metabase dashboards per-team only exist on the production environment
  if (!IS_PROD || !teamSlug) return;

  const baseUrl = `https://metabase.editor.planx.uk/public/dashboard/${DASHBOARD_ID}`;
  const url = new URL(baseUrl);

  const params = new URLSearchParams({
    tab: TAB,
    team_slug: teamSlug,
  });

  url.search = params.toString();

  return url.toString();
};

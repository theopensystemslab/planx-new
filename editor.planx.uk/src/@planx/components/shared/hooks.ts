import { useCurrentRoute } from "react-navi";

/**
 * Returns the team 'slug', which is currently always the first part
 * of the URL path.
 *
 * @example
 * // returns "southwark"
 * https://editor.planx.uk/southwark/flow/preview
 */
export const useTeamSlug = () => {
  const route = useCurrentRoute();
  return route?.data?.team;
};

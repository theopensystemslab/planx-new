/**
 * Returns the team 'slug', which is currently always the first part
 * of the URL path.
 *
 * @example
 * // returns "southwark"
 * https://editor.planx.uk/southwark/flow/preview
 */
export const useTeamSlug = () => {
  // XXX: This should really be handled by navi, but it's not clear how.
  return window.location.pathname.match(/\/([^/]+)/)?.[1];
};

import { NaviRequest, NotFoundError } from "navi";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { View } from "react-navi";
import { getTeamFromDomain } from "routes/utils";

/**
 * View wrapper for /team routes
 * Initialises TeamStore if not already set
 */
export const teamView = async (req: NaviRequest) => {
  const { initTeamStore, teamSlug: currentSlug } = useStore.getState();
  const routeSlug =
    req.params.team || (await getTeamFromDomain(window.location.hostname));

  if (currentSlug !== routeSlug) {
    try {
      await initTeamStore(routeSlug);
    } catch (error) {
      throw new NotFoundError(`Team not found: ${error}`);
    }
  }

  return <View />;
};

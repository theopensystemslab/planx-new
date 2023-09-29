import { NaviRequest, NotFoundError } from "navi"
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { View } from "react-navi"

/**
 * View wrapper for /team routes
 * Initialises TeamStore if not already set
 */
export const teamView = async (req: NaviRequest) => {
  const { teamId, initTeamStore } = useStore.getState();
  if (!teamId) {
    try {
      await initTeamStore(req.params.team);
    } catch (error) {
      throw new NotFoundError(`Team not found: ${error}`);
    }
  }
  
  return <View/>
}
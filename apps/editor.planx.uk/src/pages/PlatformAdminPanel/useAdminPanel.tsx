import { useQuery } from "@apollo/client";
import { useStore } from "pages/FlowEditor/lib/store";
import { AdminPanelData } from "types";

import {
  PRODUCTION_ADMIN_PANEL_QUERY,
  STAGING_ADMIN_PANEL_QUERY,
} from "./queries";

export const useAdminPanel = () => {
  const isPlatformAdmin = useStore((state) => state.user?.isPlatformAdmin);

  const query =
    import.meta.env.VITE_APP_ENV === "production"
      ? PRODUCTION_ADMIN_PANEL_QUERY
      : STAGING_ADMIN_PANEL_QUERY;

  return useQuery<{ adminPanel: AdminPanelData[] }>(query, {
    context: {
      headers: {
        "x-hasura-role": isPlatformAdmin ? "platformAdmin" : "analyst",
      },
    },
  });
};

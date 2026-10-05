import { createFileRoute, redirect } from "@tanstack/react-router";
import { useStore } from "pages/FlowEditor/lib/store";

export const Route = createFileRoute("/(auth)/logout")({
  beforeLoad: async () => {
    await useStore.getState().logout();

    // Full page load rather than navigation
    // This clears all in-memory state (Apollo cache, Zustand, ShareDB, subscriptions)
    throw redirect({
      to: "/login",
      search: {},
      replace: true,
      reloadDocument: true,
    });
  },
});

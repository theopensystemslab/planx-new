import { createFileRoute, redirect } from "@tanstack/react-router";
import { useStore } from "pages/FlowEditor/lib/store";

export const Route = createFileRoute("/(auth)/logout")({
  beforeLoad: async () => {
    await useStore.getState().logout();
    throw redirect({ to: "/login", search: {}, replace: true });
  },
});

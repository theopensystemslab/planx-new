import { createFileRoute, notFound, rootRouteId } from "@tanstack/react-router"
import { UserManagement } from "pages/Users";

export const Route = createFileRoute("/_authenticated/app/users")({
  component: UserManagement,
  loader: ({ context }) => {

    const isAuthorised = context.user?.isPlatformAdmin;
    if (!isAuthorised) throw notFound({ routeId: rootRouteId });
  }
})
import { createFileRoute } from "@tanstack/react-router";
import UserNotFound from "pages/ErrorPage/UserNotFound";
import { editorPageTitle } from "utils/pageTitle";

export const Route = createFileRoute("/error-user-not-found")({
  component: UserNotFound,
  head: () => editorPageTitle("User not found"),
});

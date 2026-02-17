import { createFileRoute } from "@tanstack/react-router";

import { validateDomain } from "./-loader";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: validateDomain,
});

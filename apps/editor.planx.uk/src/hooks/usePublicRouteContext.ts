import { notFound, useMatches } from "@tanstack/react-router";
import { useMemo } from "react";

type PublicRoutePattern =
  | "/$team/$flow/preview"
  | "/$team/$flow/draft"
  | "/$team/$flow/published"
  | "/$flow";

/**
 * Returns the correct route pattern for public links based on current domain context.
 * Custom domains use "/$flow" pattern, while editor.planx.uk uses "/$team/$flow/{mode}" pattern.
 *
 * Must be used to ensure type-safety and accuracy on any internal links within the _public route structure
 */
export const usePublicRouteContext = (): PublicRoutePattern => {
  const matches = useMatches();

  return useMemo(() => {
    const currentRoute = matches.at(-1);

    if (!currentRoute?.routeId) throw notFound();

    const { routeId } = currentRoute;

    const isCustomDomain = routeId.includes("_customDomain");
    const isPlanXDomain = routeId.includes("_planXDomain");

    if (isCustomDomain) return "/$flow";

    if (isPlanXDomain) {
      if (routeId.includes("/preview")) return "/$team/$flow/preview";
      if (routeId.includes("/draft")) return "/$team/$flow/draft";
      if (routeId.includes("/published")) return "/$team/$flow/published";
    }

    throw notFound();
  }, [matches]);
};

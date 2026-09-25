import type { AnyRouteMatch } from "@tanstack/react-router";

declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    /**
     * This route's segment of the page title, eg "Flows"
     * Combined with parent route segments via `editorPageTitleFromMatches`
     */
    pageTitle?: string | ((match: AnyRouteMatch) => string | undefined);
  }
}

const ENVIRONMENT_TITLE_TAGS: Record<string, string> = {
  staging: "[staging]",
  pizza: "[pizza]",
  development: "[local]",
};

/**
 * Tag for the current (non-production) environment, eg "[staging]"
 */
export const getEnvironmentTag = (): string | undefined =>
  ENVIRONMENT_TITLE_TAGS[import.meta.env.VITE_APP_ENV];

export const withEnvironmentTag = (title: string): string => {
  const environmentTag = getEnvironmentTag();
  return environmentTag ? `${environmentTag} ${title}` : title;
};

/**
 * Builds an editor page title
 */
export const formatEditorPageTitle = (
  ...parts: Array<string | undefined>
): string => {
  const title = parts.filter(Boolean).join(" - ");
  return withEnvironmentTag(title ? `${title} | Plan✕` : "Plan✕");
};

/**
 * Route `head` config which sets the page title for editor routes
 * Rendered via <HeadContent /> in the root route
 *
 * @example
 * head: () => editorPageTitle("Log in")
 */
export const editorPageTitle = (...parts: Array<string | undefined>) => ({
  meta: [{ title: formatEditorPageTitle(...parts) }],
});

/**
 * Route `head` config which builds the page title from the `staticData.pageTitle`
 * of each matched route, from most to least specific
 */
export const editorPageTitleFromMatches = (matches: AnyRouteMatch[]) =>
  editorPageTitle(
    ...matches
      .map((match) => {
        const { pageTitle } = match.staticData;
        return typeof pageTitle === "function" ? pageTitle(match) : pageTitle;
      })
      .reverse(),
  );

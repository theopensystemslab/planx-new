import { PUBLIC_PLANX_EDITOR_URL } from "astro:env/client";

/**
 * Use custom domain if available or fall back to PlanX URL
 */
export const getServiceURL = ({
  domain,
  lpaSlug,
  serviceSlug,
}: {
  domain: string | null;
  lpaSlug: string;
  serviceSlug: string;
}) =>
  domain
    ? `https://${domain}/${serviceSlug}`
    : `${PUBLIC_PLANX_EDITOR_URL}/${lpaSlug}/${serviceSlug}/published`;

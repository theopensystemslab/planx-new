export async function filterPublicLink(
  publicLink: string,
  serviceSlug: string,
  teamSlug: string,
): Promise<string> {
  const url = publicLink
    .replace("{team-slug}", teamSlug)
    .replace("{service-slug}", serviceSlug);

  return url;
}

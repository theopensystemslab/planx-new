import { $metabase } from "../shared/client.js";

export async function generatePublicLinkWithFilters(
  dashboardId: number,
  serviceSlug: string,
  teamSlug: string,
): Promise<string> {
  const response = await $metabase.post(
    `/api/dashboard/${dashboardId}/public_link`,
  );
  const filterParams = {
    service_slug: serviceSlug,
    team_slug: teamSlug,
  };

  const url = `${process.env.METABASE_URL_EXT}/public/dashboard/${response.data.uuid}?${new URLSearchParams(filterParams)}`;
  return url;
}

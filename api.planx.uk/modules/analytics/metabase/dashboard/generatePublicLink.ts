import { $metabase } from "../shared/client.js";

export async function generatePublicLink(dashboardId: number): Promise<string> {
  const response = await $metabase.post(
    `/api/dashboard/${dashboardId}/public_link`,
  );
  const url = `${process.env.METABASE_URL_EXT}/public/dashboard/${response.data.uuid}`;
  return url;
}

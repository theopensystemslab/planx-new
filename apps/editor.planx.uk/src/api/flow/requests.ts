import apiClient from "api/client";

export const moveFlow = async ({
  flowId,
  teamSlug,
}: {
  flowId: string;
  teamSlug: string;
}) => {
  const { data } = await apiClient.post<{ message: string; error?: string }>(
    `/flows/${flowId}/move/${teamSlug}`,
  );
  return data;
};

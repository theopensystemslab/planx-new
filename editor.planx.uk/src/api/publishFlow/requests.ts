import apiClient from '../client';
import {
  CheckForChangesResponse,
  PublishFlowArgs,
  PublishFlowResponse,
} from "./types";

export const checkForChanges = async (flowId: string) => {
  const { data } = await apiClient.post<CheckForChangesResponse>(
    `/flows/${flowId}/diff`
  );
  return data;
};

export const publishFlow = async ({
  flowId,
  summary,
  templatedFlowIds,
}: PublishFlowArgs & { flowId: string }) => {
  const { data } = await apiClient.post<PublishFlowResponse>(
    `${import.meta.env.VITE_APP_API_URL}/flows/${flowId}/publish`,
    {},
    {
      params: {
        summary,
        templatedFlowIds,
      },
    }
  );

  return data;
};

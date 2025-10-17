import apiClient from "api/client";

import { CreateFlowResponse, NewFlow } from "./types";

export const createFlow = async (newFlow: NewFlow) => {
  const { data } = await apiClient.post<CreateFlowResponse>(
    "/flows/create",
    newFlow,
  );

  return data;
};

export const createFlowFromCopy = async ({
  sourceId,
  teamId,
  name,
  slug,
}: NewFlow) => {
  const { data } = await apiClient.post<CreateFlowResponse>(
    `${import.meta.env.VITE_APP_API_URL}/flows/${sourceId}/copy/`,
    {
      teamId,
      name,
      slug,
      insert: true,
    },
  );

  return data;
};

export const createFlowFromTemplate = async ({
  sourceId,
  teamId,
  name,
  slug,
}: NewFlow) => {
  const { data } = await apiClient.post<CreateFlowResponse>(
    `/flows/create-from-template/${sourceId}`,
    {
      teamId,
      name,
      slug,
    },
  );

  return data;
};

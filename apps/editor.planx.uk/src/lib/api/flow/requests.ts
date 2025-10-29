import { FlowGraph } from "@opensystemslab/planx-core/types";
import apiClient from "lib/api/client";

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

export const getFlattenedFlowData = async ({
  flowId,
  isDraft = false,
}: {
  flowId: string;
  isDraft?: boolean;
}) => {
  const { data } = await apiClient.get<FlowGraph>(
    `/flows/${flowId}/flatten-data`,
    { params: { draft: isDraft } },
  );
  return data;
};

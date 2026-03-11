import apiClient from "lib/api/client";

export const getSubmissionHTML = async (sessionId: string) => {
  const { data } = await apiClient.get<string>(`/submission/${sessionId}/html`);

  return data;
};

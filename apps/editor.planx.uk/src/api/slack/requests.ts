import apiClient from "api/client";

export const sendSlackMessage = async (message: string) =>
  await apiClient.post("/send-slack-notification", { message });

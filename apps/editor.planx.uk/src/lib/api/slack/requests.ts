import apiClient from "lib/api/client";

export const sendSlackMessage = async (message: string) =>
  await apiClient.post("/send-slack-notification", { message });

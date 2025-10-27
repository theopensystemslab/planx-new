import apiClient from "api/client";

export const logout = async () => await apiClient.post("auth/logout");

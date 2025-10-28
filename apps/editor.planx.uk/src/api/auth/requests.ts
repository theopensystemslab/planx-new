import { User } from "@opensystemslab/planx-core/types";
import apiClient from "api/client";

export const getUser = async () => {
  const { data } = await apiClient.get<User & { jwt: string }>("/user/me", {
    withCredentials: true,
  });
  return data;
};

export const logout = async () => await apiClient.post("auth/logout");
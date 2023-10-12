import { $admin } from "../client";

export const cleanup = async () => {
  await $admin.user._destroyAll();
  await $admin.team._destroyAll();
};

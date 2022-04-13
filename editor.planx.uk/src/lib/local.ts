import stringify from "json-stable-stringify";

import { lowcalStorage } from "./lowcalStorage";

export const getLocalFlow = async (id: string) => {
  const entry = `flow:${id}`;

  try {
    const state = await lowcalStorage.getItem(entry);
    if (state) return JSON.parse(state);
  } catch (e) {
    // Clean up just in case
    await lowcalStorage.removeItem(entry);
  }
};

export const setLocalFlow = async (
  id: string,
  args: { [key: string]: any }
) => {
  await lowcalStorage.setItem(`flow:${id}`, stringify(args));
};

export const clearLocalFlow = async (id: string) => {
  await lowcalStorage.removeItem(`flow:${id}`);
};

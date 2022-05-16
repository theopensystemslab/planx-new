import {
  lowcalStorage,
  stringifyWithRootKeysSortedAlphabetically,
} from "./lowcalStorage";

export const getLocalFlow = async (sessionId: string) => {
  const entry = `session:${sessionId}`;
  try {
    const state = await lowcalStorage.getItem(entry);
    if (state) return JSON.parse(state);
  } catch (e) {
    // Clean up just in case
    await lowcalStorage.removeItem(entry);
  }
};

export const setLocalFlow = async (
  sessionId: string,
  args: { [key: string]: any }
) => {
  await lowcalStorage.setItem(
    `session:${sessionId}`,
    stringifyWithRootKeysSortedAlphabetically(args)
  );
};

export const clearLocalFlow = async (sessionId: string) => {
  await lowcalStorage.removeItem(`session:${sessionId}`);
};

import { Session } from "types";

import {
  lowcalStorage,
  stringifyWithRootKeysSortedAlphabetically,
} from "./lowcalStorage";

export const getLocalFlow = async (
  sessionId: string,
): Promise<Session | undefined> => {
  console.info("NEW getLocalFlow", sessionId);
  const entry = `session:${sessionId}`;
  try {
    const state = await lowcalStorage.getItem(entry);
    if (state) return JSON.parse(state);
  } catch (e) {
    // Clean up just in case
    await lowcalStorage.removeItem(entry);
  }
};

export const setLocalFlow = async (sessionId: string, session: Session) => {
  console.info("NEW setLocalFlow", sessionId);
  await lowcalStorage.setItem(
    `session:${sessionId}`,
    stringifyWithRootKeysSortedAlphabetically(session) || "",
  );
};

export const clearLocalFlow = async (sessionId: string) => {
  console.info("NEW clearLocalFlow", sessionId);
  await lowcalStorage.removeItem(`session:${sessionId}`);
};

export const saveSession = async (session: Session) => {
  console.info("saveSession", session.sessionId);
  await setLocalFlow(session.sessionId, session);
};

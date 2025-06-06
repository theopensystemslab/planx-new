import { Session } from "types";

export const getLocalFlow = (id: string): Session | undefined => {
  console.info("getLocalFlow", id);
  const entry = `flow:${id}`;

  try {
    const state = localStorage.getItem(entry);
    if (state) return JSON.parse(state);
  } catch (e) {
    // Clean up just in case
    localStorage.removeItem(entry);
  }
};

export const setLocalFlow = (id: string, session: Session): void => {
  console.info("setLocalFlow", id);
  localStorage.setItem(`flow:${id}`, JSON.stringify(session));
};

export const clearLocalFlow = (id: string): void => {
  console.info("clearLocalFlow", id);
  localStorage.removeItem(`flow:${id}`);
};

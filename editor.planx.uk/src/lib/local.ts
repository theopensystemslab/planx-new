import { Session } from "types";

export const getLocalFlow = (id: string): Session | undefined => {
  const entry = `flow:${id}`;

  try {
    const state = localStorage.getItem(entry);
    if (state) return JSON.parse(state);
  } catch (e) {
    // Clean up just in case
    localStorage.removeItem(entry);
  }
};

export const setLocalFlow = (id: string, session: Session) => {
  localStorage.setItem(`flow:${id}`, JSON.stringify(session));
};

export const clearLocalFlow = (id: string) => {
  localStorage.removeItem(`flow:${id}`);
};

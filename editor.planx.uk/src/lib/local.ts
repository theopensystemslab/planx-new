export const getLocalFlow = (id: string) => {
  const entry = `flow:${id}`;
  try {
    const state = localStorage.getItem(entry);
    if (state) return JSON.parse(state);
  } catch (e) {
    // Clean up just in case
    localStorage.removeItem(entry);
  }
};

export const setLocalFlow = (id: string, args: { [key: string]: any }) => {
  localStorage.setItem(`flow:${id}`, JSON.stringify(args));
};

export const clearLocalFlow = (id: string) => {
  localStorage.removeItem(`flow:${id}`);
};

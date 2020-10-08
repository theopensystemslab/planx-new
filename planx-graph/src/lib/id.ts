let id = 0;

export const autoIncrementingId = (): string => (id++).toString();

const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
export const alphabetId = (): string => alphabet[id++];

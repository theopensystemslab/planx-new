const alphabet = "abcdefghijklmnopqrstuvwxyz";

export const alphabetId = (x: number): string =>
  (x >= 26 ? alphabetId(((x / 26) >> 0) - 1) : "") + alphabet[x % 26 >> 0];

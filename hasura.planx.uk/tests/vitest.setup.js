import { expect } from 'vitest';

const customMatchers = {
  toHaveNoMutationsFor({ mutations }, tableName) {
    const matches = mutations.filter((mutationName) =>
      mutationName.includes(`_${tableName}`)
    );
    const pass = matches.length === 0;
    const message = () =>
      `'${tableName}' unexpectedly found in mutation(s) [${matches}]`;
    return { pass, message };
  },
};

expect.extend(customMatchers);
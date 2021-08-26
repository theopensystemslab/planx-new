expect.extend({
  toHaveSomeMutationsFor({ mutations }, tableName) {
    const matches = mutations.filter((mutationName) =>
      mutationName.includes(`_${tableName}`)
    );
    const pass = matches.length > 0;
    const message = () => `'${tableName}' found in mutation(s) [${matches}]`;
    return { pass, message };
  },
});

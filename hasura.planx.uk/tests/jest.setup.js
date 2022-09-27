require("dotenv").config({ path: "./../.env.test" });

expect.extend({
  // expects not to find any mutations containing the table name
  toHaveNoMutationsFor({ mutations }, tableName) {
    const matches = mutations.filter((mutationName) =>
      mutationName.includes(`_${tableName}`)
    );
    const pass = matches.length === 0;
    const message = () =>
      `'${tableName}' unexpectedly found in mutation(s) [${matches}]`;
    return { pass, message };
  },
});

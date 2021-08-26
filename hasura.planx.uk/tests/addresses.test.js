const { introspectAs } = require("./utils");

describe("addresses", () => {
  test("public can query addresses view", async () => {
    const { queries } = await introspectAs("public");

    expect(queries).toContain("addresses");
  });

  // Addresses is a view, not a table, so no mutation_root to additionally test here
});

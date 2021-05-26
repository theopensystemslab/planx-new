const assert = require("assert");

const { gqlPublic } = require("./utils");

describe("addresses", () => {
  test("public can only query addresses view", async () => {
    query = `
      query GetAddresses {
        addresses(limit: 5) {
          pao
          street
          town
          postcode
        }
      }
    `;

    assert.strictEqual(
      (await gqlPublic(query)).data.addresses.length,
      5
    );
  });
});

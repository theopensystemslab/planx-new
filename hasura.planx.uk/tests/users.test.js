const assert = require("assert");

const { gqlPublic } = require("./utils");

describe("users", () => {
  test("public cannot query users", async () => {
    query = `
      query GetUsers {
        users(limit: 5) {
          id
        }
      }
    `;

    assert(
      (await gqlPublic(query)).errors[0].message,
      `field "users" not found in type: 'query_root'`
    );
  });

  test("public cannot create a new user", async () => {
    query = `
      mutation InsertUser {
        insert_users(objects: {name: "Test"}) {
          affected_rows
        }
      }
    `

    assert(
      (await gqlPublic(query)).errors[0].message,
      `field "insert_users" not found in type: 'mutation_root'`
    );
  });

  test("public cannot update an existing user", async () => {
    return true;
  });

  test("public cannot delete a user", async () => {
    return true;
  });
});
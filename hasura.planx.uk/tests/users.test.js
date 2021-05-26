const assert = require("assert");

const { gqlAdmin, gqlPublic } = require("./utils");

describe("users", () => {
  let userId;

  beforeAll(async () => {
    ({
      data: {
        insert_users: {
          returning: [{ id: userId }],
        },
      },
    } = await gqlAdmin(`
      mutation InsertUser {
        insert_users(objects: {first_name: "Foo", last_name: "Bar", email: "foobar@test.com"}) {
          returning { id }
        }
      }
    `));
    assert(userId);
  });

  afterAll(async () => {
    // XXX: We're assuming that if we delete the user, then
    //      deletion will cascade into team_members
    assert.strictEqual(
      (await gqlAdmin(`
        mutation DeleteUserCascade {
          delete_users(where: {id: {_eq: "${userId}"}}) {
            affected_rows
          }
        }
      `)).data.delete_flows.affected_rows,
      1
    );
  });

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
        insert_users(objects: {first_name: "Test", last_name: "Test", email: "test@test.com"}) {
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
    query = `
      mutation UpdateUser {
        update_users_by_pk(pk_columns: {
          id: "${userId}"},
          _set: {updated_at: "NOW()"}
        ) { id }
      }
    `;

    assert(
      (await gqlPublic(query)).errors[0].message,
      `field "update_users_by_pk" not found in type 'mutation_root'`
    );
  });

  test("public cannot delete a user", async () => {
    query = `
      mutation DeleteUser {
        delete_users(where: {id: {_eq: ${userId}}}) {
          affected_rows
        }
      }
    `;

    assert(
      (await gqlPublic(query)).errors[0].message,
      `field "delete_users" not found in type: 'mutation_root'`
    );
  });
});
const assert = require("assert");

const { gqlAdmin, gqlPublic } = require("./utils");

describe("bops_applications", () => {
  let bopsApplicationId;

  beforeAll(async () => {
    ({
      data: {
        insert_bops_applications: {
          returning: [{ id: bopsApplicationId }],
        },
      },
    } = await gqlAdmin(`
      mutation InsertBopsApplication {
        insert_bops_applications(objects: {
          bops_id: "123", 
          destination_url: "bops.com", 
          request: {}, 
          req_headers: {},
          response: {},
          response_headers: {},
          session_id: "1"
        }) {
          returning {
            id
          }
        }
      }
    `));
    assert(bopsApplicationId);
  });

  afterAll(async () => {
    assert.strictEqual(
      (await gqlAdmin(`
        mutation DeleteBopsApplication {
          delete_bops_applications(where: {id: {_eq: "${bopsApplicationId}"}}) {
            affected_rows
          }
        }
      `)).data.delete_flows.affected_rows,
      1
    );
  });

  test("public cannot query bops applications", async () => {
    query = `
      query GetBopsApplications {
        bops_applications(limit: 5) {
          id
        }
      }
    `;

    assert(
      (await gqlPublic(query)).errors[0].message,
      `field "bops_applications" not found in type: 'query_root'`
    );
  });

  test("public cannot create a new bops application", async () => {
    query = `
      mutation InsertBopsApplication {
        insert_bops_applications(objects: {
          bops_id: "456", 
          destination_url: "bops.com", 
          request: {}, 
          req_headers: {},
          response: {},
          response_headers: {},
          session_id: "2"
        }) {
          affected_rows
        }
      }
    `

    assert(
      (await gqlPublic(query)).errors[0].message,
      `field "insert_bops_applications" not found in type: 'mutation_root'`
    );
  });

  test("public cannot update an existing bops application", async () => {
    query = `
      mutation UpdateBopsApplication {
        update_bops_applications_by_pk(pk_columns: {
          id: "${bopsApplicationId}"},
          _set: {session_id: "123"}
        ) { id }
      }
    `;

    assert(
      (await gqlPublic(query)).errors[0].message,
      `field "update_bops_applications_by_pk" not found in type 'mutation_root'`
    );
  });

  test("public cannot delete a bops application", async () => {
    query = `
      mutation DeleteBopsApplication {
        delete_bops_applications(where: {id: {_eq: ${bopsApplicationId}}}) {
          affected_rows
        }
      }
    `;

    assert(
      (await gqlPublic(query)).errors[0].message,
      `field "delete_bops_applications" not found in type: 'mutation_root'`
    );
  });
});

const assert = require("assert");

const { gqlAdmin, gqlPublic } = require("./utils");

describe("flows and operations", () => {
  let flowId;

  beforeAll(async () => {
    ({
      data: {
        insert_flows: {
          returning: [{ id: flowId }],
        },
      },
    } = await gqlAdmin(`
      mutation InsertFser {
        insert_flows(objects: {slug: "test"}) {
          returning { id }
        }
      }
    `));
    assert(flowId);
  });

  afterAll(async () => {
    assert.strictEqual(
      (await gqlAdmin(`
        mutation DeleteFlow {
          delete_flows(where: {id: {_eq: "${flowId}"}}) {
            affected_rows
          }
        }
      `)).data.delete_flows.affected_rows,
      1
    );
  });

  test("public can query flows", async () => {
    query = `
      query GetFlows {
        flows(where: {id: {_eq: "${flowId}"}}) {
          id
          name
          data
        }
      }
    `;

    assert.strictEqual(
      (await gqlPublic(query)).data.flows.length,
      1
    );
  });

  test("public cannot create a new flow", async () => {
    query = `
      mutation InsertFlow {
        insert_flows(objects: {slug: "test"}) {
          affected_rows
        }
      }
    `

    assert(
      (await gqlPublic(query)).errors[0].message,
      `field "insert_flows" not found in type: 'mutation_root'`
    );
  });

  test("public cannot update an existing flow", async () => {
    query = `
      mutation UpdateFlow {
        update_flows_by_pk(pk_columns: {
          id: "${flowId}"},
          _set: {updated_at: "NOW()"}
        ) { id }
      }
    `;

    assert(
      (await gqlPublic(query)).errors[0].message,
      `field "update_flows_by_pk" not found in type 'mutation_root'`
    );
  });

  test("public cannot delete a flow", async () => {
    query = `
      mutation DeleteFlow {
        delete_flows(where: {id: {_eq: "${flowId}"}}) {
          affected_rows
        }
      }
    `;

    assert(
      (await gqlPublic(query)).errors[0].message,
      `field "delete_flows" not found in type: 'mutation_root'`
    );
  });

  test("public cannot create a new operation associated with the flow", async () => {
    query = `
      mutation InsertOperation {
        insert_operations(objects: {flow_id: "${flowId}", data: {}}) {
          id
        }
      }
    `;

    assert(
      (await gqlPublic(query)).errors[0].message,
      `field "insert_operations" not found in type: 'mutation_root'`
    );
  });

  test("only admin can delete operations associated with the flow", async () => {
    query = `
      mutation DeleteOperation {
        delete_operations(where: {flow_id: {_eq: "${flowId}"}}) {
          affected_rows
        }
      }
    `;

    expect((await gqlAdmin(query)).data.delete_operations.affected_rows).toBeGreaterThanOrEqual(0);
    assert(
      (await gqlPublic(query)).errors[0].message,
      `field "delete_operations" not found in type: 'mutation_root'`
    );
  });
});

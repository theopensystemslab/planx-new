const assert = require("assert");

const { gqlAdmin } = require("./utils");

const TYPES = {
  Statement: 100,
  Response: 200,
  InternalPortal: 300,
  ExternalPortal: 310,
};

describe("merging nested external portals", () => {
  let uuids, result;

  beforeAll(async () => {
    let res = await gqlAdmin(`
      mutation {
        insert_flows(objects: [
          {slug: "TEST_root"},
          {slug: "TEST_portal"},
          {slug: "TEST_subportal"}
        ]) {
          returning {
            id
          }
        }
      }
    `);
    uuids = res.data.insert_flows.returning.map((row) => row.id);
    assert.strictEqual(uuids.length, 3);

    const [root, child, grandchild] = uuids;

    const query = `
      mutation Insert($data: jsonb!, $id: uuid!){
        update_flows_by_pk(pk_columns: {id: $id}, _set: {data: $data}) {
          data
        }
      }
    `;

    // create the root, top-level flow

    await gqlAdmin(query, {
      id: root,
      data: {
        _root: {
          edges: ["root_q1", "root_q2"],
        },
        root_q1: {
          type: TYPES.Statement,
          data: {
            text: "Root Q1",
          },
          edges: ["root_a1", "root_a2"],
        },
        root_a1: {
          type: TYPES.Response,
          data: {
            text: "Root A1",
          },
        },
        root_a2: {
          type: TYPES.Response,
          data: {
            text: "Root A2",
            edges: ["root_p1"],
          },
        },
        root_p1: {
          type: TYPES.ExternalPortal,
          data: {
            flowId: child, // link to child flow, created below
          },
        },
        root_q2: {
          type: TYPES.Statement,
          data: {
            text: "Root Q2",
          },
        },
      },
    });

    await gqlAdmin(query, {
      id: child,
      data: {
        _root: {
          edges: ["child_q1"],
        },
        child_q1: {
          edges: ["child_p1"],
        },
        child_p1: {
          type: TYPES.ExternalPortal,
          data: {
            flowId: grandchild, // link to grandchild flow, created below
          },
        },
      },
    });

    await gqlAdmin(query, {
      id: grandchild,
      data: {
        _root: {
          edges: ["grandchild_q1"],
        },
        grandchild_q1: {
          edges: ["grandchild_a1"],
        },
        grandchild_a1: {},
      },
    });

    result = await gqlAdmin(`
      query {
        flows_by_pk(id: "${root}") {
          data_merged
        }
      }
    `);
  });

  afterAll(async () => {
    const res = await gqlAdmin(`
    mutation {
      delete_flows(where: {id: {_in: ${JSON.stringify(uuids)}}}) {
        affected_rows
      }
    }
  `);
    assert.strictEqual(res.data.delete_flows.affected_rows, uuids.length);
  });

  test.skip("populates data_merged field with descendent flows", async () => {
    const [, child, grandchild] = uuids;

    expect(result.data.flows_by_pk.data_merged).toMatchObject({
      // root flow - everything untouched
      _root: {
        edges: ["root_q1", "root_q2"],
      },
      root_q1: {
        type: TYPES.Statement,
        data: {
          text: "Root Q1",
        },
        edges: ["root_a1", "root_a2"],
      },
      root_a1: {
        type: TYPES.Response,
        data: {
          text: "Root A1",
        },
      },
      root_a2: {
        type: TYPES.Response,
        data: {
          text: "Root A2",
          edges: ["root_p1"],
        },
      },
      root_p1: {
        type: TYPES.ExternalPortal,
        data: {
          flowId: child,
        },
      },
      root_q2: {
        type: TYPES.Statement,
        data: {
          text: "Root Q2",
        },
      },

      // child flow

      [child]: {
        edges: [`${child}.child_q1`],
      },
      [`${child}.child_q1`]: {
        edges: [`${child}.child_p1`],
      },
      [`${child}.child_p1`]: {
        type: TYPES.ExternalPortal,
        data: {
          flowId: grandchild,
        },
      },

      // grandchild flow

      [grandchild]: {
        edges: [`${grandchild}.grandchild_q1`],
      },
      [`${grandchild}.grandchild_q1`]: {
        edges: [`${grandchild}.grandchild_a1`],
      },
      [`${grandchild}.grandchild_a1`]: {},
    });
  });

  test("populates data_merged field with descendent flows (replacing ExtPortals with IntPortals)", async () => {
    const [, child, grandchild] = uuids;

    expect(result.data.flows_by_pk.data_merged).toMatchObject({
      // root flow - everything untouched
      _root: {
        edges: ["root_q1", "root_q2"],
      },
      root_q1: {
        type: TYPES.Statement,
        data: {
          text: "Root Q1",
        },
        edges: ["root_a1", "root_a2"],
      },
      root_a1: {
        type: TYPES.Response,
        data: {
          text: "Root A1",
        },
      },
      root_a2: {
        type: TYPES.Response,
        data: {
          text: "Root A2",
          edges: ["root_p1"],
        },
      },
      root_p1: {
        type: TYPES.InternalPortal,
        edges: [child],
      },
      root_q2: {
        type: TYPES.Statement,
        data: {
          text: "Root Q2",
        },
      },

      // child flow

      [child]: {
        edges: [`${child}.child_q1`],
      },
      [`${child}.child_q1`]: {
        edges: [`${child}.child_p1`],
      },
      [`${child}.child_p1`]: {
        type: TYPES.InternalPortal,
        edges: [grandchild],
      },

      // grandchild flow

      [grandchild]: {
        edges: [`${grandchild}.grandchild_q1`],
      },
      [`${grandchild}.grandchild_q1`]: {
        edges: [`${grandchild}.grandchild_a1`],
      },
      [`${grandchild}.grandchild_a1`]: {},
    });
  });
});

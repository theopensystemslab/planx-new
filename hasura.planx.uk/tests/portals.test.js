const assert = require("assert");

const { gqlAdmin } = require("./utils");

describe("portals", () => {
  let ids;

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
    ids = res.data.insert_flows.returning.map((row) => row.id);
    assert.strictEqual(ids.length, 3);
  });

  afterAll(async () => {
    const res = await gqlAdmin(`
    mutation {
      delete_flows(where: {id: {_in: ${JSON.stringify(ids)}}}) {
        affected_rows
      }
    }
  `);
    assert.strictEqual(res.data.delete_flows.affected_rows, ids.length);
  });

  test("data_merged field includes child and grandchild portals", async () => {
    const [root, portal, subportal] = ids;

    const query = `
      mutation Insert($data: jsonb!, $id: uuid!){
        update_flows_by_pk(pk_columns: {id: $id}, _set: {data: $data}) {
          data
        }
      }
    `;

    await gqlAdmin(query, {
      id: root,
      data: {
        _root: {
          edges: ["a", "d", "f"],
        },
        a: {
          edges: ["b", "c"],
        },
        b: {},
        c: {
          edges: ["d"],
        },
        d: {
          type: 320,
          data: {
            flowId: portal,
          },
        },
        e: {},
        f: {},
      },
    });

    await gqlAdmin(query, {
      id: portal,
      data: {
        _root: {
          edges: ["x", "another", "sub"],
        },
        x: {
          edges: ["y", "z"],
        },
        y: {},
        sub: {
          type: 320,
          data: {
            flowId: subportal,
          },
        },
        z: {},
        another: {
          edges: ["1", "2"],
        },
        1: {},
        2: {},
      },
    });

    await gqlAdmin(query, {
      id: subportal,
      data: {
        _root: {
          edges: ["s1"],
        },
        s1: {
          edges: ["s2"],
        },
        s2: {},
      },
    });

    const res = await gqlAdmin(`
      query {
        flows_by_pk(id: "${root}") {
          data_merged
        }
      }
    `);

    expect(res.data.flows_by_pk.data_merged).toMatchObject({
      // root nodes
      _root: {
        edges: ["a", "d", "f"],
      },
      a: {
        edges: ["b", "c"],
      },
      b: {},
      c: {
        edges: ["d"],
      },
      d: {
        type: 300,
        edges: ["d._root"],
      },
      e: {},
      f: {},
      // portal nodes
      "d._root": {
        edges: ["d.x", "d.another", "d.sub"],
      },
      "d.x": {
        edges: ["d.y", "d.z"],
      },
      "d.y": {},
      "d.sub": {
        type: 300,
        edges: ["d.sub.subportal"],
      },
      "d.z": {},
      "d.another": {
        edges: ["d.1", "d.2"],
      },
      "d.1": {},
      "d.2": {},
      // subportal nodes
      "d.sub._root": {
        edges: ["d.sub.s1"],
      },
      "d.sub.s1": {
        edges: ["d.sub.s2"],
      },
      "d.sub.s2": {},
    });
  });
});

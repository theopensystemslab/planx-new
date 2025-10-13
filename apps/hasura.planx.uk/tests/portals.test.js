const assert = require("assert");

const { gqlAdmin } = require("./utils");

describe("portals", () => {
  let ids;

  beforeAll(async () => {
    let res = await gqlAdmin(`
      mutation {
        insert_flows(objects: [
          {slug: "TEST_root", name: "Test root"},
          {slug: "TEST_portal", name: "Test portal"},
          {slug: "TEST_subportal", name: "Test subportal"}
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
        nodes: {
          a: {},
          b: {},
          c: {},
          d: {
            $t: 300,
            flowId: portal,
          },
          e: {},
          f: {},
        },
        edges: [
          [null, "a"],
          [null, "d"],
          ["a", "b"],
          ["a", "c"],
          ["c", "d"],
          [null, "f"],
        ],
      },
    });

    await gqlAdmin(query, {
      id: portal,
      data: {
        nodes: {
          x: {},
          y: {},
          sub: {
            $t: 300,
            flowId: subportal,
          },
          z: {},
          another: {},
          1: {},
          2: {},
        },
        edges: [
          [null, "x"],
          ["x", "y"],
          ["x", "z"],
          [null, "another"],
          [null, "sub"],
          ["another", "1"],
          ["another", "2"],
        ],
      },
    });

    await gqlAdmin(query, {
      id: subportal,
      data: {
        nodes: {
          s1: {},
          s2: {},
        },
        edges: [
          [null, "s1"],
          ["s1", "s2"],
        ],
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
      // edges order is significant, nodes does not matter
      edges: [
        // root edges
        [null, "a"],
        [null, "d"],
        ["a", "b"],
        ["a", "c"],
        ["c", "d"],
        [null, "f"],
        // portal edges with null replaced by 'd'
        ["d", "x"],
        ["x", "y"],
        ["x", "z"],
        ["d", "another"],
        ["d", "sub"],
        ["another", "1"],
        ["another", "2"],
        // subportal edges
        ["sub", "s1"],
        ["s1", "s2"],
      ],
      nodes: {
        // root nodes
        a: {},
        b: {},
        c: {},
        d: {
          $t: 300,
          flowId: portal,
        },
        e: {},
        f: {},
        // portal nodes
        x: {},
        y: {},
        sub: {
          $t: 300,
          flowId: subportal,
        },
        z: {},
        another: {},
        1: {},
        2: {},
        // subportal nodes
        s1: {},
        s2: {},
      },
    });
  });
});

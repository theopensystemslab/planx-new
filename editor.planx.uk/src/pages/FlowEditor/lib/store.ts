import { gql } from "@apollo/client";
import * as jsondiffpatch from "jsondiffpatch";
import debounce from "lodash/debounce";
import difference from "lodash/difference";
import flattenDeep from "lodash/flattenDeep";
import omit from "lodash/omit";
import natsort from "natsort";
import { v4 } from "uuid";
import create from "zustand";
import { client } from "../../../lib/graphql";
import { isValidOp, removeNodeOp } from "./flow";
import { connectToDB, getConnection } from "./sharedb";

let doc;

const jdiff = jsondiffpatch.create({
  objectHash: (obj: any) => obj.id || JSON.stringify(obj),
});

const safeKeys = (ob: any) =>
  Object.keys(ob).reduce((acc, curr) => {
    if (!curr.startsWith("$") && typeof ob[curr] === "string")
      (acc as any)[curr] = ob[curr];
    return acc;
  }, {});

const send = (...ops) => {
  doc.submitOp(flattenDeep(ops));
};

export const flags = [
  {
    value: "LB-DE_MINIMIS",
    text: "De minimis",
    category: "Listed Buildings",
  },
  {
    value: "LB-LIKELY_APPROVAL",
    text: "Likely approval",
    category: "Listed Buildings",
  },
  {
    value: "LB-ADVICE_RECOMMENDED",
    text: "Advice recommended",
    category: "Listed Buildings",
  },
  {
    value: "LB-LIKELY_REFUSAL",
    text: "Likely refusal",
    category: "Listed Buildings",
  },
  {
    value: "MISSING_INFO",
    text: "Missing information",
    category: "Planning Permission",
  },
  {
    value: "LIKELY_FAIL",
    text: "Likely refusal",
    category: "Planning Permission",
  },
  {
    value: "EDGE_CASE",
    text: "Advice recommended",
    category: "Planning Permission",
  },
  {
    value: "LIKELY_PASS",
    text: "Likely approval",
    category: "Planning Permission",
  },
  {
    value: "PLANNING_PERMISSION_REQUIRED",
    text: "Planning permission required",
    category: "Planning Permission",
  },
  {
    value: "PRIOR_APPROVAL",
    text: "Prior approval required",
    category: "Planning Permission",
  },
  {
    value: "NO_APP_REQUIRED",
    text: "Permitted development",
    category: "Planning Permission",
  },
];

export enum TYPES {
  Flow = 1,
  SignIn = 2,
  Result = 3,
  Report = 4,
  PropertyInformation = 5,
  FindProperty = 6,
  TaskList = 7,
  Notice = 8,
  Statement = 100, // Question/DropDown
  Checklist = 105,
  TextInput = 110,
  DateInput = 120,
  AddressInput = 130,
  FileUpload = 140,
  NumberInput = 150,
  Response = 200,
  Portal = 300,
}

export const [useStore, api] = create((set, get) => ({
  flow: undefined,

  id: undefined,

  connectTo: async (id: string) => {
    if (id === get().id) return; // already connected to this ID

    console.log("connecting to", id, get().id);

    doc = getConnection(id);

    await connectToDB(doc);

    set({ id });

    const cloneStateFromShareDb = () => {
      console.log("setting state");
      const flow = JSON.parse(JSON.stringify(doc.data));
      (window as any).flow = flow;
      set({ flow });
    };

    // same fn as above but waits for 1/4 second of 'silence' before running
    const debouncedCloneStateFromShareDb = debounce(cloneStateFromShareDb, 250);

    cloneStateFromShareDb();

    doc.on("op", (_op, isLocalOp) => {
      if (isLocalOp) {
        // local operation so we can assume that multiple ops are bundled together
        cloneStateFromShareDb();
      } else {
        // remote operation, it's likely that each operation will arrive sequentially
        debouncedCloneStateFromShareDb();
      }
    });
  },

  disconnect: () => {
    set({ flow: undefined, id: undefined });
    try {
      doc.destroy();
    } catch (e) {}
  },

  flowData: async () => {
    const { data } = await client.query({
      query: gql`
        query GetFlows {
          flows(order_by: { name: asc }) {
            id
            name
            slug
            team {
              slug
            }
          }
        }
      `,
    });

    const sorter = natsort({ insensitive: true });

    const externalFlows = data.flows
      .filter(
        (flow) =>
          !window.location.pathname.includes(`${flow.team.slug}/${flow.slug}`)
      )
      .sort(sorter);

    const internalFlows = Object.entries(api.getState().flow.nodes)
      .filter(
        ([id, v]: any) =>
          v.$t === TYPES.Portal &&
          !window.location.pathname.includes(id) &&
          v.text
      )
      .map(([id, { text }]: any) => ({ id, text }))
      .sort((a, b) =>
        sorter(a.text.replace(/\W|\s/g, ""), b.text.replace(/\W|\s/g, ""))
      );

    return {
      externalFlows,
      internalFlows,
    };
  },

  isClone: (id: any) =>
    get().flow.edges.filter(([, tgt]: any) => tgt === id).length > 1,

  getNode(id: any) {
    const { flow } = get();
    return {
      id,
      ...flow.nodes[id],
      // options: flow.edges
      //   .filter(([src]: any) => src === id)
      //   .map(([, id]: any) => ({ id, ...flow.nodes[id] })),
    };
  },

  addNode: (
    { id = v4(), ...data },
    children = [],
    parent = null,
    before = null,
    cb = send
  ) => {
    const { flow } = get();
    const { edges } = flow;

    let position = edges.length;

    const addNode = ({ id = v4(), ...data }, parent, before = null) => {
      if (before) {
        const index = edges.findIndex(
          ([src, tgt]: any) => src === parent && tgt === before
        );
        console.log({ parent, before, index });
        if (index >= 0) {
          position = index;
        }
      } else {
        position++;
      }

      return [
        {
          p: ["nodes", id],
          oi: data,
        },
        { p: ["edges", position], li: [parent, id] },
      ];
    };

    cb(
      addNode({ id, ...data }, parent, before),
      children.map((child) => addNode(child, id))
    );
  },

  updateNode: ({ id, ...newNode }, newOptions) => {
    const { flow, addNode, moveNode, removeNode } = get();

    const oldNode = flow.nodes[id];

    const patch = jdiff.diff(safeKeys(oldNode), safeKeys(newNode)) || {};

    // 1. update the node itself

    const getOps = (p: any, _id: any) =>
      Object.entries(p).reduce((ops: any, [k, v]: any) => {
        const p = ["nodes", _id, k];
        // https://github.com/benjamine/jsondiffpatch/blob/master/docs/deltas.md
        if (Array.isArray(v)) {
          if (v.length === 1) {
            // data was added
            ops.push({ oi: v[0], p });
          } else if (v.length === 2) {
            // data was replaced
            ops.push({ od: v[0], oi: v[1], p });
          } else if (v.length === 3 && v[1] === 0 && v[2] === 0) {
            // data was removed
            ops.push({ od: oldNode[k], p });
          }
        }
        return ops;
      }, []);
    const ops = getOps(patch, id);

    const currentOptions = flow.edges
      .filter(([src]: any) => src === id)
      .map(([, tgt]: any) => ({ id: tgt, ...flow.nodes[tgt] }));
    const currentOptionIds = currentOptions.map(({ id }: any) => id);

    const newOptionIds = newOptions.map((o) => o.id);

    // 3. update or create any direct children that have been added

    newOptions.reverse().forEach((option) => {
      if (flow.nodes[option.id]) {
        // if the option already exists...
        // check for changes and add update patches accordingly
        const patch =
          jdiff.diff(
            safeKeys(flow.nodes[option.id]),
            safeKeys(omit(option, "id"))
          ) || {};
        getOps(patch, option.id).forEach((op: any) => ops.push(op));
      } else {
        // otherwise create the option node

        addNode({ ...option, $t: TYPES.Response }, [], id, null, (op) =>
          ops.push(op)
        );
      }
    });

    // 4. reorder nodes if necessary

    if (currentOptionIds.join(",") !== newOptionIds.join(",")) {
      console.log([
        currentOptionIds.map((id: any) => flow.nodes[id]),
        newOptionIds.map((id) => flow.nodes[id]),
      ]);
      let before: any = null;
      newOptionIds.reverse().forEach((oId) => {
        moveNode(oId, id, before, id, (op) => ops.push(op));
        before = oId;
      });
    }

    // 2. remove any direct children that have been removed

    const removedIds = difference(currentOptionIds, newOptionIds);

    // removedIds.reverse().forEach((tgt) => {
    removedIds.forEach((tgt) => {
      removeNode(tgt, id, (op) => ops.push(op));
    });

    send(ops);
  },

  removeNode: (id, parent = null, cb = send) => {
    const { flow } = get();

    const relevantEdges = flow.edges.filter(([, tgt]) => tgt === id);
    if (relevantEdges.length > 1) {
      // node is in multiple places in the graph so just delete the edge
      // that is connecting it
      const index = flow.edges.findIndex(
        ([src, tgt]) => src === parent && tgt === id
      );
      if (index < 0) {
        console.error("edge not found");
      } else {
        cb([{ ld: flow.edges[index], p: ["edges", index] }]);
      }
    } else {
      cb(removeNodeOp(id, flow));
    }
  },

  moveNode(
    id: any,
    parent = null,
    toBefore = null,
    toParent = null,
    cb = send
  ) {
    const { flow } = get();
    const { edges } = flow;

    const fromIndex = edges.findIndex(
      ([src, tgt]: any) => src === parent && tgt === id
    );

    let toIndex = edges.findIndex(
      ([src, tgt]: any) => src === toParent && tgt === toBefore
    );
    if (toIndex === -1) {
      toIndex = edges.length;
    }

    if (parent === toParent) {
      if (!isValidOp(flow, toParent, id, false)) return;
      cb([{ lm: toIndex, p: ["edges", fromIndex] }]);
    } else {
      if (!isValidOp(flow, toParent, id)) return;
      let ops = [
        { ld: edges[fromIndex], p: ["edges", fromIndex] },
        { li: [toParent, id], p: ["edges", toIndex] },
      ];
      if (fromIndex < toIndex) ops = ops.reverse();
      cb(ops);
    }
  },

  copyNode(id) {
    localStorage.setItem("clipboard", id);
  },

  pasteNode(parent = null, before = null) {
    const { flow } = get();
    const id = localStorage.getItem("clipboard");

    if (id && flow.nodes[id]) {
      if (!isValidOp(flow, parent, id)) return;

      const ops = [{ li: [parent, id], p: ["edges", flow.edges.length] }];
      if (before) {
        const index = flow.edges.findIndex(
          ([src, tgt]: any) => src === parent && tgt === before
        );
        if (index >= 0) {
          ops[0] = { li: [parent, id], p: ["edges", index] };
        }
      }
      send(ops);
    }
  },

  childNodesOf(id: any, onlyPublic = false) {
    const { flow } = get();

    // console.log(`child nodes of ${id}`);

    let edges = flow.edges.filter(Boolean).filter(([src]: any) => src === id);
    if (onlyPublic) {
      edges = edges.filter(
        ([, tgt]: any) =>
          flow.edges.filter(([src]: any) => src === tgt).length > 0
      );
    }
    return edges.map(([, id]: any) => ({ id, ...flow.nodes[id] }));
  },

  createFlow: async (teamId, newName) => {
    const data = {
      nodes: {},
      edges: [],
    };

    let response = (await client.mutate({
      mutation: gql`
        mutation CreateFlow(
          $name: String
          $data: jsonb
          $slug: String
          $teamId: Int
        ) {
          insert_flows_one(
            object: {
              name: $name
              data: $data
              slug: $slug
              team_id: $teamId
              version: 1
            }
          ) {
            id
            data
          }
        }
      `,
      variables: {
        name: newName,
        slug: newName,
        teamId,
        data,
      },
    })) as any;

    const { id } = response.data.insert_flows_one;

    response = await client.mutate({
      mutation: gql`
        mutation MyMutation($flow_id: uuid, $data: jsonb) {
          insert_operations_one(
            object: { flow_id: $flow_id, data: $data, version: 1 }
          ) {
            id
          }
        }
      `,
      variables: {
        flow_id: id,
        data: {
          m: { ts: 1592485241858 },
          v: 0,
          seq: 1,
          src: "143711878a0ab64c35c32c6055358f5e",
          create: {
            data,
            type: "http://sharejs.org/types/JSONv0",
          },
        },
      },
    });

    window.location.reload();
  },
}));

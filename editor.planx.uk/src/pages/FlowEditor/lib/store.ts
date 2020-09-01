import { gql } from "@apollo/client";
import { mostReadable } from "@ctrl/tinycolor";
import { alg } from "graphlib";
import * as jsondiffpatch from "jsondiffpatch";
import debounce from "lodash/debounce";
import flatten from "lodash/flatten";
import flattenDeep from "lodash/flattenDeep";
import omit from "lodash/omit";
import natsort from "natsort";
import { v4 as uuid } from "uuid";
import create from "zustand";
import { client } from "../../../lib/graphql";
import {
  addNodeWithChildrenOp,
  isValidOp,
  moveNodeOp,
  Node,
  removeNodeOp,
  toGraphlib,
  TYPES,
} from "./flow";
import { connectToDB, getConnection } from "./sharedb";

const SUPPORTED_TYPES = [TYPES.Statement, TYPES.Checklist];

let doc;
window["doc"] = doc;

const jdiff = jsondiffpatch.create({
  objectHash: (obj: any) => obj.id || JSON.stringify(obj),
  textDiff: {
    minLength: Infinity,
  },
});

const safeKeys = (ob: any) =>
  Object.keys(ob).reduce((acc, curr) => {
    if (!curr.startsWith("$") && typeof ob[curr] === "string")
      (acc as any)[curr] = ob[curr];
    return acc;
  }, {});

const send = (...ops) => {
  ops = flattenDeep(ops);
  console.info({ ops });
  doc.submitOp(ops);
};

export const flags = [
  {
    value: "LB-DE_MINIMIS",
    text: "De minimis",
    category: "Listed Buildings",
    bgColor: "#C7DEF0",
  },
  {
    value: "LB-LIKELY_APPROVAL",
    text: "Likely approval",
    category: "Listed Buildings",
    bgColor: "#287DBC",
  },
  {
    value: "LB-ADVICE_RECOMMENDED",
    text: "Advice recommended",
    category: "Listed Buildings",
    bgColor: "#7D70B3",
  },
  {
    value: "LB-LIKELY_REFUSAL",
    text: "Likely refusal",
    category: "Listed Buildings",
    bgColor: "#574898",
  },
  {
    value: "MISSING_INFO",
    text: "Missing information",
    category: "Planning Permission",
    bgColor: "#D4D4D4",
  },
  {
    value: "LIKELY_FAIL",
    text: "Likely refusal",
    category: "Planning Permission",
    bgColor: "#FF0814",
  },
  {
    value: "EDGE_CASE",
    text: "Advice recommended",
    category: "Planning Permission",
    bgColor: "#FF8C1F",
  },
  {
    value: "LIKELY_PASS",
    text: "Likely approval",
    category: "Planning Permission",
    bgColor: "#00FA2A",
  },
  {
    value: "PLANNING_PERMISSION_REQUIRED",
    text: "Planning permission required",
    category: "Planning Permission",
    bgColor: "#000000",
  },
  {
    value: "PRIOR_APPROVAL",
    text: "Prior approval required",
    category: "Planning Permission",
    bgColor: "#FFFB2E",
  },
  {
    value: "NO_APP_REQUIRED",
    text: "Permitted development",
    category: "Planning Permission",
    bgColor: "#FFFFFF",
  },
].map((f: any) => ({
  ...f,
  color: mostReadable(f.bgColor, ["#000", "#FFF"]),
}));

export const [useStore, api] = create((set, get) => ({
  flow: undefined,

  id: undefined,

  showPreview: true,

  connectTo: async (id: string) => {
    if (id === get().id) return; // already connected to this ID

    console.log("connecting to", id, get().id);

    doc = getConnection(id);

    await connectToDB(doc);

    // set the ID of the flow to assist with deciding what to render
    set({ id });

    const cloneStateFromShareDb = () => {
      console.debug("[NF]:", JSON.stringify(doc.data, null, 0));
      const flow = JSON.parse(JSON.stringify(doc.data));
      flow.edges = flow.edges.filter((val) => !!val);
      (window as any).flow = flow;
      set({ flow });
    };

    // set state from initial load
    cloneStateFromShareDb();

    // local operation so we can assume that multiple ops will arrive
    // almost instantaneously so wait for 100ms of 'silence' before running
    const cloneStateFromLocalOps = debounce(cloneStateFromShareDb, 100);

    // remote operation, there might be network latency so wait for 0.5s
    const cloneStateFromRemoteOps = debounce(cloneStateFromShareDb, 500);

    doc.on("op", (_op, isLocalOp) =>
      isLocalOp ? cloneStateFromLocalOps() : cloneStateFromRemoteOps()
    );
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
        ([id, v]: [string, Node]) =>
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

  isClone: (id: string) => {
    return get().flow.edges.filter(([, tgt]: any) => tgt === id).length > 1;
  },

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

  addNode: (data, children = [], parent = null, before = null, cb = send) => {
    const { flow } = get();
    console.debug(
      `[OP]: addNodeWithChildrenOp(${JSON.stringify(data)}, ${JSON.stringify(
        children
      )}, ${JSON.stringify(parent)}, ${JSON.stringify(before)}, beforeFlow);`
    );

    if (data.flowId && flow.nodes[data.flowId]) {
      let position = flow.edges.length;
      if (before) {
        const index = flow.edges.findIndex(
          ([src, tgt]: any) => src === parent && tgt === before
        );
        console.log({ parent, before, index });
        if (index >= 0) {
          position = index;
        }
      } else {
        position++;
      }
      cb([{ p: ["edges", position], li: [parent, data.flowId] }]);
    } else {
      cb(addNodeWithChildrenOp(data, children, parent, before, flow));
    }
  },

  updateNode: ({ id, ...newNode }, newOptions: any[], cb = send) => {
    const { flow, addNode } = get();

    console.debug(
      `[OP]: updateNodeOp(${JSON.stringify(newNode)}, ${JSON.stringify(
        newOptions
      )}, beforeFlow);`
    );

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

    // 2. update or create any direct children that have been added
    newOptions.forEach((option) => {
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

    // // 4. remove any direct children that have been removed
    // const removedIds = difference(currentOptionIds, newOptionIds);
    // removedIds.forEach((tgt) => {
    //   removeNode(tgt, id, (op) => ops.push(op));
    // });

    // // 3. reorder nodes if necessary
    // if (currentOptionIds.join(",") !== newOptionIds.join(",")) {
    //   console.log({
    //     currentOptionIds,
    //     newOptionIds,
    //   });

    //   let initialIdx = flow.edges.findIndex(
    //     ([src, tgt]: any) => src === id && tgt === currentOptionIds[0]
    //   );

    //   // const sortOps = [];

    //   // let before: any = null;
    //   [...newOptionIds].forEach((oId, count) => {
    //     const fromIndex = flow.edges.findIndex(
    //       ([src, tgt]: any) => src === id && tgt === oId
    //     );
    //     let toIndex = initialIdx + count;

    //     if (fromIndex < toIndex) toIndex -= 1;

    //     // sortOps.push({ lm: toIndex, p: ["edges", fromIndex] });
    //     // moveNode(oId, id, before, id, (op) => ops.push(op));
    //     // ops.push(moveNodeOp(oId, id, null, id, flow));
    //     // before = oId;
    //   });
    //   // console.log(sortOps.sort((a, b): any => a.p[1] - b.p[2]));
    //   // console.log(sortOps);
    //   // ops.push(sortOps);
    // }

    cb(ops);
  },

  makeUnique: (id, parent = null) => {
    const { flow, isClone } = get();

    if (flow.nodes[id].$t === TYPES.Portal) {
      return alert("Portals not yet supported");
    }

    const graph = toGraphlib(flow);

    const keys = alg.preorder(graph, [id]).reduce((acc, nodeId) => {
      acc[nodeId] = isClone(nodeId)
        ? id === nodeId
          ? uuid()
          : nodeId
        : uuid();
      return acc;
    }, {});

    const ops = Object.entries(keys).reduce(
      (acc, [existingId, newId]: [string, string]) => {
        if (!flow.nodes[newId]) {
          acc.push({
            p: ["nodes", newId],
            oi: flow.nodes[existingId],
          });
        }

        flow.edges
          .filter(([src, tgt]) => src === existingId)
          .reverse()
          .forEach(([src, tgt]) => {
            acc.push({ li: [keys[src], keys[tgt]], p: ["edges", Infinity] });
          });

        return acc;
      },
      [
        {
          li: [parent, keys[id]],
          p: ["edges", Infinity],
        },
      ] as any
    );

    if (isClone(id)) {
      const idx = flow.edges.findIndex(
        ([src, tgt]) => src === parent && tgt === id
      );
      ops.unshift({
        p: ["edges", idx],
        ld: flow.edges[idx],
      });
    }

    send(ops);
  },

  removeNode: (id, parent = null, cb = send) => {
    const { flow } = get();
    console.debug(
      `[OP]: removeNodeOp(${JSON.stringify(id)}, ${JSON.stringify(
        parent
      )}, beforeFlow);`
    );
    cb(removeNodeOp(id, parent, flow));
  },

  moveNode(
    id: string,
    parent = null,
    toBefore = null,
    toParent = null,
    cb = send
  ) {
    const { flow } = get();
    console.debug(
      `[OP]: moveNodeOp(${JSON.stringify(id)}, ${JSON.stringify(
        parent
      )}, ${JSON.stringify(toBefore)}, ${JSON.stringify(
        toParent
      )}, beforeFlow);`
    );
    cb(moveNodeOp(id, parent, toBefore, toParent, flow));
  },

  copyNode(id: string) {
    localStorage.setItem("clipboard", id);
  },

  pasteNode(parent = null, before = null, cb = send) {
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
      cb(ops);
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

  deleteFlow: async (teamId, flowSlug: string) => {
    const response = await client.mutate({
      mutation: gql`
        mutation MyMutation($flow_slug: String) {
          delete_flows(where: { slug: { _eq: $flow_slug } }) {
            affected_rows
          }
        }
      `,
      variables: {
        flow_slug: flowSlug,
      },
    });
    return response;
  },

  // Preview

  breadcrumbs: {},

  setFlow(id, flow) {
    set({ id, flow });
  },

  upcomingCardIds() {
    const { flow, breadcrumbs } = get();

    const ids = new Set();

    const idsForParent = (parent: any) =>
      flow.edges
        .filter(([src]: any) => src === parent)
        .filter(
          ([, tgt]: any) =>
            [TYPES.FindProperty, TYPES.PropertyInformation].includes(
              flow.nodes[tgt].$t
            ) || flow.edges.filter(([src]: any) => src === tgt).length > 0
        )
        .map(([, tgt]: any) => tgt)
        .filter((id: any) => !Object.keys(breadcrumbs).includes(id))
        .forEach((id: any) => {
          if (flow.nodes[id].$t === TYPES.Portal) {
            idsForParent(id);
          } else {
            ids.add(id);
          }
        });

    flatten(Object.values(breadcrumbs))
      .reverse()
      .forEach((id) => idsForParent(id));

    idsForParent(null);

    return Array.from(ids).filter((id: any) =>
      SUPPORTED_TYPES.includes(flow.nodes[id].$t)
    );
  },

  record(id: any, vals: any) {
    const { breadcrumbs } = get();
    if (vals) {
      set({ breadcrumbs: { ...breadcrumbs, [id]: vals } });
    } else {
      set({ breadcrumbs: omit(breadcrumbs, id) });
    }
  },

  currentCard() {
    const { upcomingCardIds, flow } = get();
    const upcoming = upcomingCardIds();

    if (upcoming.length > 0) {
      return {
        id: upcoming[0],
        ...flow.nodes[upcoming[0]],
      };
    } else {
      return null;
    }
  },
}));

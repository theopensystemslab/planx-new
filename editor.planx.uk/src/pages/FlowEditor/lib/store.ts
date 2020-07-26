import { gql } from "@apollo/client";
import debounce from "lodash/debounce";
import flattenDeep from "lodash/flattenDeep";
import natsort from "natsort";
import { v4 } from "uuid";
import create from "zustand";
import { client } from "../../../lib/graphql";
import { isValidOp, removeNodeOp } from "./flow";
import { connectToDB, getConnection } from "./sharedb";

let doc;

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

    const cloneStateFromShareDb = () => {
      console.log("setting state");
      const flow = JSON.parse(JSON.stringify(doc.data));
      (window as any).flow = flow;
      set({ flow });
    };

    await connectToDB(doc);

    set({ id });

    cloneStateFromShareDb();

    // wait 1/4 second after receiving any operation(s) before setting state, in case
    // more come down the wire. (doc.on seems to get called per individual operation)
    doc.on("op", debounce(cloneStateFromShareDb, 250));
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
    before = null
  ) => {
    const flow = get();
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

    send(
      addNode({ id, ...data }, parent, before),
      children.map((child) => addNode(child, id))
    );
  },

  removeNode: (id, parent = null) => {
    const { flow } = get();

    const relevantEdges = flow.edges.filter(([, tgt]) => tgt === id);

    if (relevantEdges.length > 1) {
      // node is in multiple places in the graph so just delete the edge
      // that is connecting it
      const index = relevantEdges.findIndex(
        ([src, tgt]) => src === parent && tgt === id
      );
      if (index < 0) {
        console.error("edge not found");
      } else {
        send([{ ld: flow.edges[index], p: ["edges", index] }]);
      }
    } else {
      // remove the node entirely
      send(removeNodeOp(id, flow));
    }
  },

  moveNode(id: any, parent = null, toBefore = null, toParent = null) {
    const flow = get();
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

    if (!isValidOp(flow, toParent, id)) {
      console.error("invalid op");
      return;
    }

    if (parent === toParent) {
      send([{ lm: toIndex, p: ["edges", fromIndex] }]);
    } else {
      let ops = [
        { ld: edges[fromIndex], p: ["edges", fromIndex] },
        { li: [toParent, id], p: ["edges", toIndex] },
      ];
      if (fromIndex < toIndex) ops = ops.reverse();
      send(ops);
    }
  },

  copyNode(id) {
    localStorage.setItem("clipboard", id);
  },

  pasteNode(parent = null, before = null) {
    const { flow } = get();
    const id = localStorage.getItem("clipboard");

    if (id && flow.nodes[id]) {
      if (!isValidOp(flow, parent, id)) {
        console.error("invalid op");
        return;
      }

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

    let edges = flow.edges.filter(([src]: any) => src === id);
    if (onlyPublic) {
      edges = edges.filter(
        ([, tgt]: any) =>
          flow.edges.filter(([src]: any) => src === tgt).length > 0
      );
    }
    return edges.map(([, id]: any) => ({ id, ...flow.nodes[id] }));
  },
}));

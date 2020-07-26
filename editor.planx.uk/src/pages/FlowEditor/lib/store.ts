import debounce from "lodash/debounce";
import { v4 } from "uuid";
import create from "zustand";
import { connectToDB, getConnection } from "./sharedb";

let doc;

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

  addNode: () => {
    const id = v4();
    doc.submitOp([
      {
        p: ["nodes", id],
        oi: {
          $t: TYPES.Statement,
          text: id,
        },
      },
      { p: ["edges", 0], li: [null, id] },
    ]);
  },

  removeNode: (id) => {
    const { flow } = get();
    const index = flow.edges.findIndex(
      ([src, tgt]) => src === null && tgt === id
    );

    doc.submitOp([
      {
        p: ["edges", index],
        ld: flow.edges[index],
      },
      {
        p: ["nodes", id],
        od: flow.nodes[id],
      },
    ]);
  },

  childNodesOf(id: any, onlyPublic = false) {
    const { flow } = get();

    console.log(`child nodes of ${id}`);

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

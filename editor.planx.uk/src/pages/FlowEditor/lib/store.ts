import { gql } from "@apollo/client";
import tinycolor from "@ctrl/tinycolor";
import debounce from "lodash/debounce";
import difference from "lodash/difference";
import flattenDeep from "lodash/flattenDeep";
import omit from "lodash/omit";
import uniq from "lodash/uniq";
import { customAlphabet } from "nanoid";
import pgarray from "pg-array";
import create from "zustand";
import { client } from "../../../lib/graphql";
import Graph, { ROOT_NODE_KEY } from "../../../planx-graph/src/graph";
import { FlowLayout } from "../components/Flow";
import flags from "../data/flags";
import { TYPES } from "../data/types";
import { connectToDB, getConnection } from "./sharedb";

const alphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const uid = customAlphabet(alphabet, 12);

const SUPPORTED_DECISION_TYPES = [TYPES.Checklist, TYPES.Statement];

let doc;

const send = (...ops) => {
  ops = flattenDeep(ops);
  if (ops.length > 0) {
    console.log({ ops });
    doc.submitOp(ops);
  }
};

export const [useStore, api] = create((set, get) => ({
  flow: undefined,

  id: undefined,

  showPreview: true,

  flowLayout: FlowLayout.TOP_DOWN,

  connectTo: async (id: string) => {
    if (id === get().id) return; // already connected to this ID

    console.log("connecting to", id, get().id);

    doc = getConnection(id);
    window["doc"] = doc;

    await connectToDB(doc);

    // set the ID of the flow to assist with deciding what to render
    set({ id });

    const cloneStateFromShareDb = () => {
      // console.debug("[NF]:", JSON.stringify(doc.data, null, 0));
      const flow = JSON.parse(JSON.stringify(doc.data));
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

  isClone: (id: string) => {
    // TODO: reimplement this!
    return false;
  },

  getNode(id: any) {
    return {
      id,
      ...get().flow[id],
    };
  },

  addNode: (
    { id = uid(), type, data },
    children = [],
    parent = ROOT_NODE_KEY,
    before = undefined,
    cb = send
  ) => {
    const { flow } = get();
    const g = new Graph(uid);
    g.load(flow);

    const ops = g.add({ id, type, ...data }, { children, before, parent });

    cb(ops);
  },

  updateNode: ({ id, data }, children: any[], cb = send) => {
    const g = new Graph(uid);
    g.load(get().flow);
    const ops = g.update(id, data, { children, removeKeyIfMissing: true });
    cb(ops);
  },

  makeUnique: (id, parent = null) => {
    // TODO: reimplement this!
    alert("not implemented");
  },

  removeNode: (id, parent = undefined, cb = send) => {
    const g = new Graph(uid);
    g.load(get().flow);
    const ops = g.remove(id, { parent });
    cb(ops);
  },

  moveNode(
    id: string,
    parent = undefined,
    toBefore = undefined,
    toParent = undefined,
    clone = false,
    cb = send
  ) {
    const { flow, resetPreview } = get();

    const g = new Graph(uid);
    g.load(flow);

    try {
      const ops = g.move(id, { fromParent: parent, toBefore, toParent, clone });
      cb(ops);
      resetPreview();
    } catch (err) {
      alert(err.message);
    }
  },

  copyNode(id: string, parent: string = undefined) {
    localStorage.setItem("clipboard", JSON.stringify({ id, parent }));
  },

  pasteNode(newParent, before) {
    try {
      const { id, parent } = JSON.parse(localStorage.getItem("clipboard"));
      get().moveNode(id, parent, before, newParent, true);
    } catch (err) {
      alert(err.message);
    }
  },

  childNodesOf(id: string = ROOT_NODE_KEY) {
    const { flow } = get();
    return (flow[id]?.edges || []).map((id) => ({ id, ...flow[id] }));
  },

  createFlow: async (teamId, newName, data = { nodes: {}, edges: [] }) => {
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

    // TODO: change this to window.location.href = `/${team.slug}/${flow.slug}`
    window.location.reload();
  },

  deleteFlow: async (teamId, flowSlug: string) => {
    const response = await client.mutate({
      mutation: gql`
        mutation MyMutation($team_id: Int, $flow_slug: String) {
          delete_flows(
            where: { team_id: { _eq: $team_id }, slug: { _eq: $flow_slug } }
          ) {
            affected_rows
          }
        }
      `,
      variables: {
        flow_slug: flowSlug,
        team_id: teamId,
      },
    });
    return response;
  },

  // Preview

  passport: {
    data: {},
  },

  sessionId: "",

  breadcrumbs: {},

  async startSession({ passport }) {
    // convert data to format described in google sheet:
    // https://docs.google.com/spreadsheets/d/1ePihRD37-2071Wq6t2Y7QtBt7juySWuVP6SAF6T-0vo/edit#gid=1877209331
    const keys = Object.entries(passport.data)
      .filter(([, { value }]: any) => value)
      .map(([k]) => k);
    console.log({ keys });

    const value = [];
    if (keys.includes("property.landConservation"))
      value.push("designated.conservationArea");
    if (keys.includes("property.landTPO")) value.push("TPO");
    if (keys.includes("property.buildingListed")) value.push("listed");

    passport.data["property.constraints.planning"] = { value };

    set({
      passport: {
        ...passport,
        data: {
          ...(get().passport.data || {}),
          ...(passport.data || {}),
        },
      },
    });

    const response = await client.mutate({
      mutation: gql`
        mutation CreateSession(
          $flow_data: jsonb
          $flow_id: uuid
          $flow_version: Int
          $passport: jsonb
        ) {
          insert_sessions_one(
            object: {
              flow_data: $flow_data
              flow_id: $flow_id
              flow_version: $flow_version
              passport: $passport
            }
          ) {
            id
          }
        }
      `,
      variables: {
        flow_data: get().flow,
        flow_id: get().id,
        flow_version: 0, // TODO: add flow version
        passport,
      },
    });
    const sessionId = response.data.insert_sessions_one.id;
    set({ sessionId });
  },

  resetPreview() {
    set({ breadcrumbs: {}, passport: { data: {} }, sessionId: "" });
  },

  setFlow(id, flow) {
    set({ id, flow });
  },

  flagResult() {
    const { flow, breadcrumbs } = get();

    const possibleFlags = flags.filter(
      (f) => f.category === "Planning permission"
    );

    const keys = possibleFlags.map((f) => f.value);

    const collectedFlags = Object.values(breadcrumbs)
      .flatMap((v: string) =>
        Array.isArray(v)
          ? v.map((id) => flow.nodes[id]?.flag)
          : flow.nodes[v]?.flag
      )
      .filter(Boolean)
      .sort((a, b) => keys.indexOf(a) - keys.indexOf(b));

    const flag = possibleFlags.find((f) => f.value === collectedFlags[0]);

    return (
      flag || {
        value: "PP-NO_RESULT",
        text: "No result",
        category: "Planning permission",
        bgColor: "#EEEEEE",
        color: tinycolor("black"),
      }
    );
  },

  upcomingCardIds() {
    return [];
  },

  record(id: any, vals: any) {
    const { breadcrumbs, sessionId, upcomingCardIds, flow, passport } = get();
    // vals may be string or string[]
    if (vals) {
      const key = flow.nodes[id].fn;
      if (key) {
        let passportValue;
        if (Array.isArray(vals)) {
          passportValue = vals.map((id) => flow.nodes[id].val);
        } else {
          passportValue = [flow.nodes[vals].val];
        }

        passportValue = passportValue.filter(
          (val) =>
            val !== undefined && val !== null && String(val).trim() !== ""
        );

        if (passportValue.length > 0) {
          if (passport.data[key] && Array.isArray(passport.data[key].value)) {
            passportValue = uniq(
              passport.data[key].value.concat(passportValue)
            );
          }

          set({
            breadcrumbs: { ...breadcrumbs, [id]: vals },
            passport: {
              ...passport,
              data: {
                ...passport.data,
                [key]: { value: passportValue },
              },
            },
          });
        } else {
          set({
            breadcrumbs: { ...breadcrumbs, [id]: vals },
          });
        }
      } else {
        set({ breadcrumbs: { ...breadcrumbs, [id]: vals } });
      }

      // only store breadcrumbs in the backend if they are answers provided for
      // either a Statement or Checklist type. TODO: make this more robust
      if (SUPPORTED_DECISION_TYPES.includes(flow.nodes[id].type) && sessionId) {
        addSessionEvent();
        if (upcomingCardIds().length === 0) {
          endSession();
        }
      }
    } else {
      // remove breadcrumbs that were stored from id onwards
      let keepBreadcrumb = true;
      const fns = [];
      const newFns = [];
      const newBreadcrumbs = Object.entries(breadcrumbs).reduce(
        (acc, [k, v]) => {
          const fn = flow.nodes[k]?.fn;
          if (fn) fns.push(fn);
          if (k === id) {
            keepBreadcrumb = false;
          } else if (keepBreadcrumb) {
            if (fn) newFns.push(fn);
            acc[k] = v;
          }
          return acc;
        },
        {}
      );

      set({
        breadcrumbs: newBreadcrumbs,
        passport: {
          ...passport,
          data: omit(passport.data, ...difference(fns, newFns)),
        },
      });
    }

    function addSessionEvent() {
      client.mutate({
        mutation: gql`
          mutation CreateSessionEvent(
            $chosen_node_ids: _text
            $type: session_event_type
            $session_id: uuid
            $parent_node_id: String
          ) {
            insert_session_events_one(
              object: {
                chosen_node_ids: $chosen_node_ids
                session_id: $session_id
                type: $type
                parent_node_id: $parent_node_id
              }
            ) {
              id
            }
          }
        `,
        variables: {
          chosen_node_ids: Array.isArray(vals)
            ? pgarray(vals)
            : pgarray([vals]),
          session_id: get().sessionId,
          type: "human_decision", // TODO
          parent_node_id: id,
        },
      });
    }

    function endSession() {
      client.mutate({
        mutation: gql`
          mutation EndSession($id: uuid!, $completed_at: timestamptz!) {
            update_sessions_by_pk(
              pk_columns: { id: $id }
              _set: { completed_at: $completed_at }
            ) {
              id
            }
          }
        `,
        variables: {
          id: get().sessionId,
          // TODO: Move this logic to the backend
          //       Could be done with a SQL Function exposed through Hasura as a mutation (e.g. end_session)
          completed_at: new Date(),
        },
      });
    }
  },

  responsesForReport() {
    const { breadcrumbs, flow } = get();
    return Object.entries(breadcrumbs)
      .map(([k, v]: [string, string | Array<string>]) => {
        const responses = (Array.isArray(v)
          ? v.map((id) => flow.nodes[id]?.text)
          : [flow.nodes[v]?.text]
        ).filter(Boolean);
        return {
          id: k,
          text: `${flow.nodes[k]?.text} <strong>${responses.join(
            ", "
          )}</strong>`,
        };
      })
      .filter((o) => !o.text.includes("undefined"));
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

window["api"] = api;

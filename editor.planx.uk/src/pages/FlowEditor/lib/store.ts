import { gql } from "@apollo/client";
import tinycolor from "@ctrl/tinycolor";
import { alg } from "graphlib";
import * as jsondiffpatch from "jsondiffpatch";
import debounce from "lodash/debounce";
import difference from "lodash/difference";
import flattenDeep from "lodash/flattenDeep";
import omit from "lodash/omit";
import pgarray from "pg-array";
import { v4 as uuid } from "uuid";
import create from "zustand";
import { client } from "../../../lib/graphql";
import { FlowLayout } from "../components/Flow";
import flags from "../data/flags";
import { TYPES } from "../data/types";
import { getOps as getImmerOps } from "./adapters/immer";
import {
  addNodeWithChildrenOp,
  isValidOp,
  moveNodeOp,
  removeNode,
  removeNodeOp,
  toGraphlib,
} from "./flow";
import { connectToDB, getConnection } from "./sharedb";

const SUPPORTED_INFORMATION_TYPES = [
  TYPES.Content,
  TYPES.FindProperty,
  TYPES.Notice,
  TYPES.PropertyInformation,
  TYPES.Result,
  TYPES.TaskList,
  TYPES.FileUpload,
];

const SUPPORTED_DECISION_TYPES = [
  TYPES.Checklist,
  TYPES.Statement,
  TYPES.FileUpload,
];

const SUPPORTED_TYPES = [
  TYPES.Portal,
  ...SUPPORTED_INFORMATION_TYPES,
  ...SUPPORTED_DECISION_TYPES,
];

let doc;

const jdiff = jsondiffpatch.create({
  objectHash: (obj: any) => obj.id || JSON.stringify(obj),
  textDiff: {
    minLength: Infinity,
  },
});

const send = (...ops) => {
  ops = flattenDeep(ops);
  console.log(ops);
  doc.submitOp(ops);
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

  isClone: (id: string) => {
    return get().flow.edges.filter(([, tgt]: any) => tgt === id).length > 1;
  },

  getNode(id: any) {
    const { flow } = get();
    return {
      id,
      ...flow.nodes[id],
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
    const { flow } = get();

    const ops = getImmerOps(flow, (draft) => {
      // 1. update the node itself
      const originalNode = JSON.parse(JSON.stringify(draft.nodes[id]));
      const delta = jdiff.diff(originalNode, newNode);
      jdiff.patch(draft.nodes[id], delta);

      // 2. remove responses/options that no longer exist

      let existingOptionIds = draft.edges
        .filter(([src]: any) => src === id)
        .map(([, tgt]) => tgt);

      let newOptionIds = newOptions.filter((o) => o.text).map((o) => o.id);

      let removedIds = difference(existingOptionIds, newOptionIds);

      removedIds.forEach((rId) => {
        removeNode(rId, id, draft);
      });

      // 3. update/create children that have been added

      // const optionsChanged =
      //   existingOptionIds.join(",") !== newOptionIds.join(",");

      const usableNewOptions = newOptions
        .filter((o) => o.text && !removedIds.includes(o.id))
        .map((option) => ({ id: option.id || uuid(), ...option }));

      usableNewOptions.forEach(({ id: oId, ...node }) => {
        if (draft.nodes[oId]) {
          // option already exists, update it
          const originalNode = JSON.parse(JSON.stringify(draft.nodes[oId]));
          const delta = jdiff.diff(originalNode, node);
          jdiff.patch(draft.nodes[oId], delta);

          // if (optionsChanged) {
          //   const pos = draft.edges.findIndex(
          //     ([src, tgt]) => src === id && tgt === oId
          //   );
          //   draft.edges.push(draft.edges.splice(pos, 1)[0]);
          // }
        } else {
          draft.nodes[oId] = { $t: TYPES.Response, ...node };
          draft.edges.push([id, oId]);
        }
      });
    });

    cb(ops);
  },

  makeUnique: (id, parent = null) => {
    const { flow, isClone } = get();

    if (flow.nodes[id].$t === TYPES.Portal) {
      if (
        !window.confirm(
          "Making portals unique isn't officially supported yet, are you sure that you want to do this?"
        )
      )
        return;
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
    const { flow, resetPreview } = get();
    console.debug(
      `[OP]: moveNodeOp(${JSON.stringify(id)}, ${JSON.stringify(
        parent
      )}, ${JSON.stringify(toBefore)}, ${JSON.stringify(
        toParent
      )}, beforeFlow);`
    );
    cb(moveNodeOp(id, parent, toBefore, toParent, flow));

    resetPreview();
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

    const collectedFlags = Object.entries(breadcrumbs)
      .map(([k, v]: any) => flow.nodes[v].flag)
      .filter(Boolean)
      .sort((a, b) => keys.indexOf(b.flag) - keys.indexOf(a.flag));

    console.log(collectedFlags);

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
    const { flow, breadcrumbs, passport } = get();

    const ids = new Set();
    // TODO: this can be GREATLY simplified and optimised!

    const nodeIdsConnectedFrom = (
      source: string | null,
      sourceParent: string = undefined
    ) => {
      return (
        flow.edges
          // 3. find all outgoing edges from the node 'source' and ensure that the
          //    target ids returned are of supported node types
          .filter(([src, tgt]: any) => {
            return (
              src === source &&
              flow.nodes[tgt] &&
              SUPPORTED_TYPES.includes(flow.nodes[tgt].$t)
            );
          })
          // 4. return 'information type' nodes, or, if the node is something else
          //    i.e. a 'question type', then only include it if it has one
          //    or more answers/options for the user to choose.
          //    TLDR; don't include questions with no possible answers
          .filter(
            ([, tgt]: any) =>
              SUPPORTED_INFORMATION_TYPES.includes(flow.nodes[tgt].$t) ||
              flow.edges.filter(([src]: any) => src === tgt).length > 0
          )
          // 5. return an array of the nodes filtered above
          .map(([, tgt]: any) => tgt)
          // 6. exclude nodes which have already been 'visited' in the graph
          //    i.e. stored in the breadcrumbs
          .filter((id: any) => !Object.keys(breadcrumbs).includes(id))
          .forEach((id: any) => {
            if (flow.nodes[id].$t === TYPES.Portal) {
              // 7a.  if the node is a portal, don't add it node to the list of
              //      upcoming nodes, instead check/add all of the nodes it connects to
              nodeIdsConnectedFrom(id);
            } else {
              // 7b.  if the node is not a portal, we now know that it is either
              //      informational e.g. TaskList or a question e.g. Question, and
              //      that it hasn't been visited already (because it's not been
              //      stored in the 'breadcrumbs'), so add it to the upcoming list

              const fn = flow.nodes[id]?.fn;
              if (fn && passport.data[fn]?.value !== undefined) {
                // TODO: add much-needed docs here
                const responses = flow.edges
                  .filter(([src]) => src === id)
                  .map(([_, tgt]) => ({ id: tgt, ...flow.nodes[tgt] }));

                const responseThatCanBeAutoAnswered = responses.find(
                  (n) => n.val === passport.data[fn].value
                );

                if (responseThatCanBeAutoAnswered) {
                  nodeIdsConnectedFrom(responseThatCanBeAutoAnswered.id);
                } else {
                  ids.add(id);
                }
              } else {
                ids.add(id);
              }
            }
          })
      );
    };

    // 1. get all of the values of breadcrumbs. breadcrumbs looks like this
    //   {
    //     [QUESTION_ID_1]: CHOSEN_ANSWER_ID_1,
    //     [QUESTION_ID_2]: [CHOSEN_ANSWER_ID_2, CHOSEN_ANSWER_ID_3],
    //   }
    Object.entries(breadcrumbs)
      .reverse()
      // 2. so, in this example case, we would now iterate through
      //    (CHOSEN_ANSWER_ID_3, CHOSEN_ANSWER_ID_2, CHOSEN_ANSWER_ID_1)
      .forEach(([question, answers]: [string, string | string[]]) => {
        if (Array.isArray(answers)) {
          answers.forEach((answer) => nodeIdsConnectedFrom(answer, question));
        } else {
          nodeIdsConnectedFrom(answers, question);
        }
      }); // (steps 3-7 in nodeIdsConnectedFrom function)

    // 8. now we have checked for any follow-up questions for answers we
    //    have already visited, let's check for any 'root' questions that might
    //    still need to be answered. i.e. questions with no parent, that appear
    //    on the main thread below root questions we have already answered
    nodeIdsConnectedFrom(null);

    // 9. we stored 'ids' as a Set() to ensure that they were unqiue, let's
    //    now make that a unique array before returning it
    return Array.from(ids);
  },

  record(id: any, vals: any) {
    const { breadcrumbs, sessionId, upcomingCardIds, flow, passport } = get();
    // vals may be string or string[]
    if (vals) {
      set({ breadcrumbs: { ...breadcrumbs, [id]: vals } });

      if (flow.nodes[id].fn) {
        let passportValue;
        if (Array.isArray(vals)) {
          passportValue = vals
            .map((id) => flow.nodes[id].val)
            .filter((v) => v !== undefined);
        } else {
          passportValue = flow.nodes[vals].val;
        }

        set({
          passport: {
            ...passport,
            data: {
              ...passport.data,
              [flow.nodes[id].fn]: { value: passportValue },
            },
          },
        });
      }

      // only store breadcrumbs in the backend if they are answers provided for
      // either a Statement or Checklist type. TODO: make this more robust
      if (SUPPORTED_DECISION_TYPES.includes(flow.nodes[id].$t) && sessionId) {
        addSessionEvent();
        if (upcomingCardIds().length === 0) {
          endSession();
        }
      }
    } else {
      set({ breadcrumbs: omit(breadcrumbs, id) });
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
      .map(([k, v]: any) => {
        return {
          text: `${flow.nodes[k]?.text} <strong>${flow.nodes[v]?.text}</strong>`,
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

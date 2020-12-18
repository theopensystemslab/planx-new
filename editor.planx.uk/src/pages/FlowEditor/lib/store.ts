import { gql } from "@apollo/client";
import tinycolor from "@ctrl/tinycolor";
import { TYPES } from "@planx/components/types";
import {
  add,
  clone,
  isClone,
  makeUnique,
  move,
  remove,
  ROOT_NODE_KEY,
  update,
} from "@planx/graph";
import debounce from "lodash/debounce";
import difference from "lodash/difference";
import omit from "lodash/omit";
import uniq from "lodash/uniq";
import pgarray from "pg-array";
import create from "zustand";
import vanillaCreate from "zustand/vanilla";

import { client } from "../../../lib/graphql";
import { FlowLayout } from "../components/Flow";
import { flatFlags } from "../data/flags";
import { connectToDB, getConnection } from "./sharedb";

const SUPPORTED_DECISION_TYPES = [TYPES.Checklist, TYPES.Statement];

let doc;
let globalFlag;

const send = (ops) => {
  if (ops.length > 0) {
    console.log({ ops });
    doc.submitOp(ops);
  }
};

const mostToLeastNumberOfValues = (b, a) =>
  String(a.data?.val).split(",").length - String(b.data?.val).split(",").length;

export type componentOutput = undefined | null | any | Array<any>;
export type userData = { answers: componentOutput; auto?: boolean };
export type breadcrumbs = Record<string, userData>;
export type nodeId = string;
export type node = { id?: nodeId; type?: TYPES; data?: any; edges?: nodeId[] };
export type flow = Record<string, node>;
export interface passport {
  data?: any;
  info?: any;
}

interface Store extends Record<string | number | symbol, unknown> {
  addNode: any; //: () => void;
  childNodesOf: (string) => Record<string, any>[];
  connect: (src: string, tgt: string, object?) => void;
  connectTo: (string) => void;
  copyNode: (string) => void;
  createFlow: any; //: () => Promise<string>;
  deleteFlow: (teamId: number, flowSlug: string) => Promise<object>;
  flow: flow;
  flowLayout: FlowLayout;
  getFlows: any; //: () => any;
  getNode: (string) => Record<string, any>;
  id: string;
  isClone: (string) => boolean;
  makeUnique: any; //: () => void;
  moveNode: any; //: () => void;
  pasteNode: any; //: () => void;
  removeNode: any; //: () => void;
  showPreview: boolean;
  togglePreview: () => void;
  updateNode: any; //: () => void;
  // preview
  breadcrumbs: breadcrumbs;
  replay: () => object;
  currentNodes: (
    start: string
  ) => { showContinue: boolean; upcoming: Array<Record<string, any>> } | null;
  passport: passport;
  record: any; //: () => void;
  reportData: any; //: () => any;
  resetPreview: any; //: () => void;
  sessionId: any; //: string;
  setFlow: any; //: () => void;
  startSession: any; //: () => void;
  upcomingCardIds: (id?: string) => nodeId[];

  page: string;
  setPage: (page: string) => void;
  dfs: (start: string, useBreadcrumbs?: boolean) => any[];
}

export const vanillaStore = vanillaCreate<Store>((set, get) => ({
  page: ROOT_NODE_KEY,

  setPage: (page) => {
    set({ page });
  },

  flow: undefined,

  id: undefined,

  showPreview: true,

  togglePreview: () => {
    set({ showPreview: !get().showPreview });
  },

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
    // TODO: this can be faster!
    return isClone(id, get().flow);
  },

  getNode(id: any) {
    return {
      id,
      ...get().flow[id],
    };
  },

  connect: (src: string, tgt: string, { before = undefined } = {}) => {
    try {
      const [, ops] = clone(tgt, { toParent: src, toBefore: before })(
        get().flow
      );
      send(ops);
    } catch (err) {
      alert(err.message);
    }
  },

  addNode: (
    { id = undefined, type, data },
    { children = undefined, parent = ROOT_NODE_KEY, before = undefined } = {}
  ) => {
    const [, ops] = add(
      { id, type, data },
      { children, parent, before }
    )(get().flow);
    send(ops);
  },

  updateNode: ({ id, data }, { children = undefined } = {}) => {
    const [, ops] = update(id, data, {
      children,
      removeKeyIfMissing: true,
    })(get().flow);
    send(ops);
  },

  makeUnique: (id, parent = undefined) => {
    const [, ops] = makeUnique(id, parent)(get().flow);
    send(ops);
  },

  removeNode: (id, parent = undefined) => {
    const [, ops] = remove(id, parent)(get().flow);
    send(ops);
  },

  moveNode(
    id: string,
    parent = undefined,
    toBefore = undefined,
    toParent = undefined
  ) {
    try {
      const [, ops] = move(id, parent, { toParent, toBefore })(get().flow);
      send(ops);
      get().resetPreview();
    } catch (err) {
      alert(err.message);
    }
  },

  copyNode(id: string) {
    localStorage.setItem("clipboard", id);
  },

  pasteNode(toParent, toBefore) {
    try {
      const id = localStorage.getItem("clipboard");
      const [, ops] = clone(id, { toParent, toBefore })(get().flow);
      send(ops);
    } catch (err) {
      alert(err.message);
    }
  },

  childNodesOf(id: string = ROOT_NODE_KEY) {
    const { flow } = get();
    return (flow[id]?.edges || []).map((id) => ({ id, ...flow[id] }));
  },

  getFlows: async (teamId: number) => {
    client.cache.reset();
    const { data } = await client.query({
      query: gql`
        query GetFlow($teamId: Int!) {
          flows(
            order_by: { updated_at: desc }
            where: { team: { id: { _eq: $teamId } } }
          ) {
            id
            name
            slug
            updated_at
            operations(limit: 1, order_by: { id: desc }) {
              actor {
                first_name
                last_name
              }
            }
          }
        }
      `,
      variables: {
        teamId,
      },
    });

    return data;
  },

  createFlow: async (teamId, newName, data = {}): Promise<string> => {
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

    return newName;
  },

  deleteFlow: async (teamId, flowSlug) => {
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
    // ------ BEGIN PASSPORT DATA OVERRIDES ------

    // TODO: move all of the logic in this block out of here and update the API

    // In this block we are converting the vars stored in passport.data object
    // from the old boolean values style to the new array style. This should be
    // done on a server but as a temporary fix the data is currently being
    // converted here.

    // More info:
    // GitHub comment explaining what's happening here https://bit.ly/2HFnxX2
    // Google sheet with new passport schema https://bit.ly/39eYp4A

    const keys = Object.entries(passport.data)
      .filter(([, { value }]: any) => value)
      .map(([k]) => k);

    const constraints = [];

    if (keys.includes("property.landConservation"))
      constraints.push("designated.conservationArea");
    if (keys.includes("property.landTPO")) constraints.push("TPO");
    if (keys.includes("property.buildingListed")) constraints.push("listed");

    passport.data =
      constraints.length > 0
        ? { "property.constraints.planning": constraints }
        : {};
    // ------ END PASSPORT DATA OVERRIDES ------

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
    set({
      breadcrumbs: {},
      passport: { data: {} },
      sessionId: "",
      page: ROOT_NODE_KEY,
    });
  },

  setFlow(id, flow) {
    set({ id, flow });
  },

  upcomingCardIds(start = ROOT_NODE_KEY) {
    const { flow, breadcrumbs, passport } = get();

    const ids: Set<string> = new Set();

    const nodeIdsConnectedFrom = (source: string) => {
      return (flow[source]?.edges ?? [])
        .filter(
          (id) =>
            !Object.keys(breadcrumbs).includes(id) &&
            (!SUPPORTED_DECISION_TYPES.includes(flow[id].type) ||
              flow[id]?.edges?.length > 0)
        )
        .forEach((id) => {
          if ([TYPES.InternalPortal].includes(flow[id]?.type)) {
            nodeIdsConnectedFrom(id);
          } else {
            const fn = flow[id]?.data?.fn;

            let passportValues =
              fn === "flag" ? globalFlag : passport.data[fn]?.value?.sort();

            if (fn && (fn === "flag" || passportValues !== undefined)) {
              const responses = flow[id]?.edges.map((id) => ({
                id,
                ...flow[id],
              }));

              let responseThatCanBeAutoAnswered;
              const sortedResponses = responses
                .sort(mostToLeastNumberOfValues)
                .filter((response) => response.data?.val);

              if (passportValues !== undefined) {
                if (!Array.isArray(passportValues))
                  passportValues = [passportValues];

                passportValues = (passportValues || []).filter((pv) =>
                  sortedResponses.some((r) => pv.startsWith(r.data.val))
                );

                if (passportValues.length > 0) {
                  responseThatCanBeAutoAnswered = sortedResponses.find((r) => {
                    const responseValues = String(r.data.val).split(",").sort();
                    return String(responseValues) === String(passportValues);
                  });

                  if (!responseThatCanBeAutoAnswered) {
                    responseThatCanBeAutoAnswered = sortedResponses.find(
                      (r) => {
                        const responseValues = String(r.data.val)
                          .split(",")
                          .sort();
                        for (const responseValue of responseValues) {
                          // console.log({ value, val });
                          return passportValues.every((passportValue) =>
                            String(passportValue).startsWith(responseValue)
                          );
                        }
                      }
                    );
                  }
                }
              }

              if (!responseThatCanBeAutoAnswered) {
                responseThatCanBeAutoAnswered = responses.find(
                  (r) => !r.data?.val
                );
              }

              if (responseThatCanBeAutoAnswered) {
                if (fn !== "flag") {
                  set({
                    breadcrumbs: {
                      ...breadcrumbs,
                      [id]: {
                        answers: [responseThatCanBeAutoAnswered.id],
                        auto: true,
                      },
                    },
                  });
                }

                nodeIdsConnectedFrom(responseThatCanBeAutoAnswered.id);
              } else {
                ids.add(id);
              }
            } else {
              ids.add(id);
            }
          }
        });
    };

    Object.entries(breadcrumbs)
      .reverse()
      .forEach(([, { answers }]: any) => {
        answers.forEach((answer) => nodeIdsConnectedFrom(answer));
      });

    nodeIdsConnectedFrom(start);

    return Array.from(ids);
  },

  replay() {
    const { flow, breadcrumbs } = get();
    return Object.entries(breadcrumbs)
      .map(([id, bc]) => {
        const { edges = [], ...question } = flow[id];

        const options = edges.map((id) => {
          const { edges, ...node } = flow[id];
          return {
            id,
            ...node,
          };
        });

        if (options.length === 0) return null;

        return {
          question: { id, ...question },
          options,
          choices: bc.answers,
          auto: bc.auto,
        };
      })
      .filter(Boolean);
  },

  currentNodes(start) {
    const { flow, dfs, breadcrumbs, upcomingCardIds } = get();

    if (start === ROOT_NODE_KEY) {
      let upcoming = upcomingCardIds().map((id) => ({ id, ...flow[id] }));
      if (upcoming.length > 0) {
        return { showContinue: false, upcoming: upcoming.slice(0, 1) };
      } else {
        return null;
      }
    } else {
      const types = [
        TYPES.Response,
        TYPES.InternalPortal,
        TYPES.ExternalPortal,
      ];

      let upcoming = dfs(start)
        .map((id) => ({ id, ...flow[id] }))
        .filter((x) => {
          if (start === ROOT_NODE_KEY) {
            return !breadcrumbs[x.id] && !types.includes(x.type);
          } else {
            return (
              !types.includes(x.type) &&
              (!SUPPORTED_DECISION_TYPES.includes(x.type) ||
                x.edges?.length > 0)
            );
          }
        });

      const showContinue = upcoming
        .map((x) => x.id)
        .every((id) => breadcrumbs[id]);

      if (upcoming.length > 0) {
        return { showContinue, upcoming };
      } else {
        return null;
      }
    }
  },

  record(id: nodeId, vals: componentOutput) {
    const { breadcrumbs, sessionId, upcomingCardIds, flow, passport } = get();

    if (!flow[id]) throw new Error("id not found");

    if (vals) {
      vals = Array.isArray(vals) ? vals : [vals];

      const key = flow[id].data?.fn;
      if (key) {
        let passportValue;
        passportValue = vals.map((id) => flow[id]?.data?.val);

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
          console.log("AAA");
          set({
            breadcrumbs: {
              ...breadcrumbs,
              [id]: { answers: vals, auto: false },
            },
            passport: {
              ...passport,
              data: {
                ...passport.data,
                [key]: { value: passportValue },
              },
            },
          });
        } else {
          console.log("bbb");
          set({
            breadcrumbs: {
              ...breadcrumbs,
              [id]: { answers: vals, auto: false },
            },
          });
        }
      } else {
        // console.log("ccc");
        // let page = ROOT_NODE_KEY;
        // const upcoming = upcomingCardIds();

        // if (upcoming.length > 1 && flow[upcoming[1]].type === TYPES.Page) {
        //   page = upcoming[1];
        // }

        set({
          breadcrumbs: { ...breadcrumbs, [id]: { answers: vals, auto: true } },
          // page,
        });
      }

      // only store breadcrumbs in the backend if they are answers provided for
      // either a Statement or Checklist type. TODO: make this more robust
      if (SUPPORTED_DECISION_TYPES.includes(flow[id].type) && sessionId) {
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
          const fn = flow[k]?.data?.fn;
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

      console.log("ddd");
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

  reportData() {
    const { breadcrumbs, flow } = get();

    // const categories = Array.from(new Set(flags.map((f) => f.category)));
    const categories = ["Planning permission"];

    return categories.reduce((acc, category) => {
      const possibleFlags = flatFlags.filter((f) => f.category === category);
      const keys = possibleFlags.map((f) => f.value);

      const collectedFlags = Object.values(breadcrumbs).flatMap(({ answers }) =>
        Array.isArray(answers)
          ? answers.map((id) => flow[id]?.data?.flag)
          : flow[answers]?.data?.flag
      );

      const filteredCollectedFlags = collectedFlags
        .filter((flag) => flag && keys.includes(flag))
        .sort((a, b) => keys.indexOf(a) - keys.indexOf(b));

      const flag = possibleFlags.find(
        (f) => f.value === filteredCollectedFlags[0]
      ) || {
        // value: "PP-NO_RESULT",
        value: undefined,
        text: "No result",
        category,
        bgColor: "#EEEEEE",
        color: tinycolor("black").toHexString(),
      };
      globalFlag = flag.value;

      const responses = Object.entries(breadcrumbs)
        .map(
          ([k, { answers }]: [string, { answers: string | Array<string> }]) => {
            const question = { id: k, ...flow[k] };

            if (!SUPPORTED_DECISION_TYPES.includes(question?.type)) return null;

            answers = Array.isArray(answers) ? answers : [answers];

            const selections = answers.map((id) => ({ id, ...flow[id] }));
            const hidden = !selections.some(
              (r) => r.data?.flag && r.data.flag === flag?.value
              // possibleFlags.includes(r.data.flag)
            );

            return {
              question,
              selections,
              hidden,
            };
          }
        )
        .filter(Boolean);

      acc[category] = {
        flag,
        responses: responses.every((r) => r.hidden)
          ? responses.map((r) => ({ ...r, hidden: false }))
          : responses,
      };

      return acc;
    }, {});
  },

  dfs(start) {
    const { flow, breadcrumbs, passport } = get();

    const visited: Set<string> = new Set();

    const list: Set<string> = new Set();
    const hidden: Set<string> = new Set();

    const listToExplore: string[] = [start];
    visited.add(start);

    const flatBreadcrumbs = Object.entries(breadcrumbs)
      .reduce((acc, [k, v]) => acc.concat([k, ...v.answers]), [] as string[])
      .concat(start);

    while (listToExplore.length) {
      const next = listToExplore.pop();
      if (next && flow[next]) {
        const { type, edges = [], data: { fn } = {} } = flow[next];

        list.add(next);

        if (
          type === TYPES.InternalPortal ||
          flatBreadcrumbs.includes(next) ||
          hidden.has(next)
        ) {
          [...edges]
            .reverse()
            .filter((i) => !visited.has(i))
            .forEach((childIndex: string) => {
              listToExplore.push(childIndex);
              visited.add(childIndex);
            });
        } else if (
          passport.data &&
          passport.data[fn] &&
          passport.data[fn].value
        ) {
          let passportValues = passport.data[fn].value.sort();

          if (fn && passportValues !== undefined) {
            const sortedResponses = [...edges]
              .filter((i) => !visited.has(i))
              .map((id) => ({ id, ...flow[id] }))
              .sort(mostToLeastNumberOfValues)
              .filter((response) => response.data?.val);

            if (!Array.isArray(passportValues))
              passportValues = [passportValues];

            passportValues = (passportValues || []).filter((pv) =>
              sortedResponses.some((r) => pv.startsWith(r.data.val))
            );

            for (let i = 0; i < sortedResponses.length; i++) {
              const { id, data: { val } = {} } = sortedResponses[i];
              const responseValues = String(val).split(",").sort();
              if (String(responseValues) === String(passportValues)) {
                hidden.add(next);
                hidden.add(id);
                listToExplore.push(id);
                visited.add(id);
                break;
              }
            }
          }
        }
      }
    }

    return Array.from(list)
      .slice(1)
      .filter((i) => !hidden.has(i));
  },
}));

export const useStore = create(vanillaStore);

window["api"] = useStore;

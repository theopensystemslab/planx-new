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
  sortIdsDepthFirst,
  update,
} from "@planx/graph";
import produce from "immer";
import debounce from "lodash/debounce";
import difference from "lodash/difference";
import flatten from "lodash/flatten";
import uniq from "lodash/uniq";
import pgarray from "pg-array";
import create from "zustand";
import vanillaCreate from "zustand/vanilla";

import { client } from "../../../lib/graphql";
import type { Flag, FlowSettings } from "../../../types";
import { FlowLayout } from "../components/Flow";
import { DEFAULT_FLAG_CATEGORY, flatFlags } from "../data/flags";
import { connectToDB, getConnection } from "./sharedb";

const SUPPORTED_DECISION_TYPES = [TYPES.Checklist, TYPES.Statement];

let doc: any;

const send = (ops: Array<any>) => {
  if (ops.length > 0) {
    console.log({ ops });
    doc.submitOp(ops);
  }
};

export type componentOutput = undefined | null | any | Array<any>;
export type userData = { answers: componentOutput; auto?: boolean };
export type breadcrumbs = Record<string, userData>;
export type nodeId = string;
export type node = { id?: nodeId; type?: TYPES; data?: any; edges?: nodeId[] };
export type flow = Record<string, node>;
export interface passport {
  initialData?: any;
  data?: any;
  info?: any;
}

interface Store extends Record<string | number | symbol, unknown> {
  addNode: any; //: () => void;
  childNodesOf: (id: string | undefined) => Record<string, any>[];
  connect: (src: string, tgt: string, object?: any) => void;
  connectTo: (id: string) => void;
  copyNode: (id: string) => void;
  createFlow: any; //: () => Promise<string>;
  deleteFlow: (teamId: number, flowSlug: string) => Promise<object>;
  flow: flow;
  flowLayout: FlowLayout;
  getFlows: any; //: () => any;
  getNode: (id: string) => Record<string, any>;
  id: string;
  isClone: (id: string) => boolean;
  hasPaid: () => boolean;
  makeUnique: any; //: () => void;
  moveNode: any; //: () => void;
  pasteNode: any; //: () => void;
  removeNode: any; //: () => void;
  showPreview: boolean;
  togglePreview: () => void;
  updateNode: any; //: () => void;
  wasVisited: (id: string) => boolean;
  // preview
  breadcrumbs: breadcrumbs;
  currentCard: () => Record<string, any> | null;
  passport: passport;
  record: any; //: () => void;
  resultData: (
    flagSet?: string,
    overrides?: { [flagId: string]: { heading?: string; description?: string } }
  ) => {
    [category: string]: {
      flag: Flag;
      responses: any[];
      displayText: { heading: string; description: string };
    };
  };
  resetPreview: any; //: () => void;
  mutatePassport: (mutation: (passport: passport) => void) => void;
  sessionId: any; //: string;
  setFlow: any; //: () => void;
  startSession: any; //: () => void;
  resumeSession: (session: {
    passport: Store["passport"];
    breadcrumbs: Store["breadcrumbs"];
    sessionId: Store["sessionId"];
    id: Store["id"];
  }) => void;
  previousCard: () => nodeId | undefined;
  collectedFlags: (
    upToNodeId: string,
    visited?: Array<string>
  ) => Array<string>;
  upcomingCardIds: () => nodeId[];
  updateFlowSettings: (
    flowId: string,
    newSettings: FlowSettings
  ) => Promise<number>;
}

export const vanillaStore = vanillaCreate<Store>((set, get) => ({
  flow: (undefined as unknown) as flow,

  id: (undefined as unknown) as string,

  showPreview: true,

  togglePreview: () => {
    set({ showPreview: !get().showPreview });
  },

  flowLayout: FlowLayout.TOP_DOWN,

  connectTo: async (id: string) => {
    if (id === get().id) return; // already connected to this ID

    console.log("connecting to", id, get().id);

    doc = getConnection(id);
    (window as any)["doc"] = doc;

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

    doc.on("op", (_op: any, isLocalOp?: boolean) =>
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
    { id = undefined, type, data }: any,
    { children = undefined, parent = ROOT_NODE_KEY, before = undefined } = {}
  ) => {
    const [, ops] = add(
      { id, type, data },
      { children, parent, before }
    )(get().flow);
    send(ops);
  },

  updateNode: ({ id, data }: any, { children = undefined } = {}) => {
    const [, ops] = update(id, data, {
      children,
      removeKeyIfMissing: true,
    })(get().flow);
    send(ops);
  },

  wasVisited(id) {
    const visited = Object.entries(get().breadcrumbs).reduce(
      (acc: Array<string>, [k, v]) => {
        acc.push(k);
        return acc.concat(v.answers || []);
      },
      []
    );
    return visited.includes(id);
  },

  makeUnique: (id: any, parent = undefined) => {
    const [, ops] = makeUnique(id, parent)(get().flow);
    send(ops);
  },

  removeNode: (id: any, parent: any = undefined) => {
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
      const [, ops] = move(id, (parent as unknown) as string, {
        toParent,
        toBefore,
      })(get().flow);
      send(ops);
      get().resetPreview();
    } catch (err) {
      alert(err.message);
    }
  },

  copyNode(id: string) {
    localStorage.setItem("clipboard", id);
  },

  pasteNode(toParent: any, toBefore: any) {
    try {
      const id = localStorage.getItem("clipboard");
      if (id) {
        const [, ops] = clone(id, { toParent, toBefore })(get().flow);
        send(ops);
      }
    } catch (err) {
      alert(err.message);
    }
  },

  childNodesOf(id: string | undefined = ROOT_NODE_KEY) {
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

  createFlow: async (teamId: any, newName: any): Promise<string> => {
    const data = { [ROOT_NODE_KEY]: { edges: [] } };
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

  mutatePassport(mutation) {
    set({
      passport: produce(get().passport, mutation),
    });
  },

  async startSession({
    passport,
  }: {
    passport: { data: Record<string, any>; info: any };
  }) {
    try {
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
    } catch (e) {}
  },

  resumeSession(args) {
    set(args);
  },

  resetPreview() {
    set({ breadcrumbs: {}, passport: { data: {} }, sessionId: "" });
  },

  setFlow(id: any, flow: any) {
    set({ id, flow });
  },

  previousCard: () => {
    const goBackable = Object.entries(get().breadcrumbs)
      .filter(([k, v]: any) => !v.auto)
      .map(([k]) => k);

    return goBackable.pop();
  },

  hasPaid: () => {
    const { breadcrumbs, flow } = get();

    return Object.keys(breadcrumbs).some(
      (crumb) => flow[crumb].type === TYPES.Pay
    );
  },

  upcomingCardIds() {
    const { flow, breadcrumbs, passport, collectedFlags } = get();

    const ids: Set<nodeId> = new Set();
    const visited: Set<nodeId> = new Set();

    const knownNotVals = Object.entries(breadcrumbs).reduce(
      (acc, [id, { answers = [] }]) => {
        const _knownNotVals = difference(flow[id].edges, answers);

        acc[flow[id].data?.fn] = uniq(
          flatten([
            ...(acc[flow[id].data?.fn] || []),
            _knownNotVals.flatMap((n) => flow[n].data?.val),
          ])
        ).filter(Boolean) as Array<nodeId>;

        return acc;
      },
      {} as Record<nodeId, Array<nodeId>>
    );

    const nodeIdsConnectedFrom = (source: nodeId): void => {
      return (flow[source]?.edges ?? [])
        .filter((id) => {
          if (visited.has(id)) return false;

          visited.add(id);

          const node = flow[id];

          return (
            node &&
            !breadcrumbs[id] &&
            ((node.edges || []).length > 0 ||
              (node.type && !SUPPORTED_DECISION_TYPES.includes(node.type)))
          );
        })
        .forEach((id) => {
          const node = flow[id];

          if (
            node.type &&
            [TYPES.InternalPortal, TYPES.Page].includes(node.type)
          ) {
            return nodeIdsConnectedFrom(id);
          }

          const fn = node.type === TYPES.Filter ? "flag" : node.data?.fn;

          const [globalFlag] = collectedFlags(id, Array.from(visited));

          let passportValues =
            fn === "flag" ? globalFlag : passport.data[fn]?.value?.sort();

          if (fn && (fn === "flag" || passportValues !== undefined)) {
            const responses = node.edges?.map((id) => ({
              id,
              ...flow[id],
            }));

            let responsesThatCanBeAutoAnswered = [] as any[];

            const sortedResponses = responses
              ? responses
                  // sort by the most to least number of comma-separated items in data.val
                  .sort(
                    (a: any, b: any) =>
                      String(b.data?.val).split(",").length -
                      String(a.data?.val).split(",").length
                  )
                  .filter((response) => response.data?.val)
              : [];

            if (passportValues !== undefined) {
              if (!Array.isArray(passportValues))
                passportValues = [passportValues];

              passportValues = (passportValues || []).filter((pv: any) =>
                sortedResponses.some((r) => pv.startsWith(r.data.val))
              );

              if (passportValues.length > 0) {
                responsesThatCanBeAutoAnswered = (sortedResponses || []).filter(
                  (r) => {
                    const responseValues = String(r.data.val).split(",").sort();
                    return String(responseValues) === String(passportValues);
                  }
                );

                if (responsesThatCanBeAutoAnswered.length === 0) {
                  responsesThatCanBeAutoAnswered = (
                    sortedResponses || []
                  ).filter((r) => {
                    const responseValues = String(r.data.val).split(",").sort();

                    for (const responseValue of responseValues) {
                      return passportValues.some((passportValue: any) =>
                        String(passportValue).startsWith(responseValue)
                      );
                    }
                  });
                }
              }
            }

            if (responsesThatCanBeAutoAnswered.length === 0) {
              const _responses = (responses || []).filter(
                (r) => !knownNotVals[fn]?.includes(r.data.val)
              );
              if (_responses.length === 1) {
                responsesThatCanBeAutoAnswered = _responses;
              } else if (
                !passport.data[fn] ||
                passport.data[fn].value.length > 0
              ) {
                responsesThatCanBeAutoAnswered = (responses || []).filter(
                  (r) => !r.data?.val
                );
              }
            }

            if (responsesThatCanBeAutoAnswered.length > 0) {
              if (node.type !== TYPES.Checklist) {
                responsesThatCanBeAutoAnswered = responsesThatCanBeAutoAnswered.slice(
                  0,
                  1
                );
              }

              if (fn !== "flag") {
                set({
                  breadcrumbs: {
                    ...breadcrumbs,
                    [id]: {
                      answers: responsesThatCanBeAutoAnswered.map((r) => r.id),
                      auto: true,
                    },
                  },
                });
              }

              return responsesThatCanBeAutoAnswered.forEach((r) =>
                nodeIdsConnectedFrom(r.id)
              );
            }
          } else if (
            fn &&
            knownNotVals[fn] &&
            passportValues === undefined &&
            Array.isArray(node.edges)
          ) {
            const data = node.edges.reduce(
              (acc, edgeId) => {
                if (flow[edgeId].data?.val === undefined) {
                  acc.responseWithNoValueId = edgeId;
                } else if (!knownNotVals[fn].includes(flow[edgeId].data?.val)) {
                  acc.edges.push(edgeId);
                }
                return acc;
              },
              { edges: [] } as {
                responseWithNoValueId?: nodeId;
                edges: Array<nodeId>;
              }
            );

            if (data.responseWithNoValueId && data.edges.length === 0) {
              set({
                breadcrumbs: {
                  ...breadcrumbs,
                  [id]: {
                    answers: [data.responseWithNoValueId],
                    auto: true,
                  },
                },
              });
              return nodeIdsConnectedFrom(data.responseWithNoValueId);
            }
          }

          ids.add(id);
        });
    };

    // with a guaranteed unique set
    new Set(
      // of all the answers collected so far
      Object.values(breadcrumbs)
        // in reverse order
        .reverse()
        .flatMap(({ answers }) => answers)
        .filter(Boolean)
        // ending with _root
        .concat(ROOT_NODE_KEY)
      // run nodeIdsConnectedFrom(answerId)
    ).forEach(nodeIdsConnectedFrom);

    // then return an array of the upcoming node ids, in depth-first order
    return sortIdsDepthFirst(flow)(ids);
  },

  currentCard() {
    const { upcomingCardIds, flow } = get();
    const upcoming = upcomingCardIds();

    if (upcoming.length > 0) {
      const id = upcoming[0];
      return {
        id,
        ...flow[id],
      };
    } else {
      return null;
    }
  },

  record(id: nodeId, vals: componentOutput) {
    const { breadcrumbs, sessionId, upcomingCardIds, flow, passport } = get();

    if (!flow[id]) throw new Error("id not found");

    if (vals) {
      vals = Array.isArray(vals) ? vals : [vals];

      const key = flow[id].data?.fn;
      if (key) {
        let passportValue = vals.map((id: string) => flow[id]?.data?.val);

        passportValue = passportValue.filter(
          (val: any) =>
            val !== undefined && val !== null && String(val).trim() !== ""
        );

        if (passportValue.length > 0) {
          if (passport.data[key] && Array.isArray(passport.data[key].value)) {
            const allValues = uniq(
              passport.data[key].value.concat(passportValue)
            ).sort() as Array<string>;

            passportValue = allValues.reduce((acc: Array<string>, curr) => {
              if (allValues.some((x) => !x.startsWith(curr))) {
                acc.push(curr);
              }
              return acc;
            }, []);
          }

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
          set({
            breadcrumbs: {
              ...breadcrumbs,
              [id]: { answers: vals, auto: false },
            },
          });
        }
      } else {
        set({
          breadcrumbs: { ...breadcrumbs, [id]: { answers: vals, auto: false } },
        });
      }

      const flowIdType = flow[id]?.type;

      // only store breadcrumbs in the backend if they are answers provided for
      // either a Statement or Checklist type. TODO: make this more robust
      if (
        flowIdType &&
        SUPPORTED_DECISION_TYPES.includes(flowIdType) &&
        sessionId
      ) {
        addSessionEvent();
        if (upcomingCardIds().length === 0) {
          endSession();
        }
      }
    } else {
      // remove breadcrumbs that were stored from id onwards
      let keepBreadcrumb = true;

      const data: Record<string, { value: Array<string> }> = {
        ...(passport.initialData || {}),
      };

      const newBreadcrumbs = Object.entries(breadcrumbs).reduce(
        (acc: Record<string, any>, [questionId, v]) => {
          if (questionId === id) {
            keepBreadcrumb = false;
          } else if (keepBreadcrumb) {
            acc[questionId] = v;

            const fn = flow[questionId]?.data?.fn;
            if (fn) {
              const { answers = [] } = v;

              const value = answers
                .map((aId: string) => flow[aId]?.data?.val)
                .filter(Boolean);

              if (value) {
                data[fn] = { value };
              }
            }
          }
          return acc;
        },
        {}
      );

      set({
        breadcrumbs: newBreadcrumbs,
        passport: {
          ...passport,
          data,
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

  collectedFlags(upToNodeId, visited = []) {
    const { breadcrumbs, flow } = get();

    // TODO: Should this be all flags?
    const possibleFlags = flatFlags.filter(
      (f) => f.category === DEFAULT_FLAG_CATEGORY
    );
    const flagKeys = possibleFlags.map((f) => f.value);

    const breadcrumbIds = Object.keys(breadcrumbs);

    const idx = breadcrumbIds.indexOf(upToNodeId);

    let ids: Array<string> = [];

    if (idx >= 0) {
      ids = breadcrumbIds.slice(0, idx + 1);
    } else if (visited.length > 1 && visited.includes(upToNodeId)) {
      ids = breadcrumbIds.filter((id) => visited.includes(id));
    }

    const res = ids
      .reduce((acc, k) => {
        breadcrumbs[k].answers.forEach((id: string) => {
          acc.push(flow[id]?.data?.flag);
        });
        return acc;
      }, [] as Array<string>)
      .filter((flag) => flag && flagKeys.includes(flag))
      .sort((a, b) => flagKeys.indexOf(a) - flagKeys.indexOf(b));

    return res;
  },

  resultData(flagSet = DEFAULT_FLAG_CATEGORY, overrides) {
    const { breadcrumbs, flow } = get();

    const categories = [flagSet];

    return categories.reduce(
      (
        acc: {
          [category: string]: {
            flag: Flag;
            responses: any[];
            displayText: { heading: string; description: string };
          };
        },
        category: string
      ) => {
        // TODO: DRY this up with preceding collectedFlags function?
        const possibleFlags = flatFlags.filter((f) => f.category === category);
        const keys = possibleFlags.map((f) => f.value);
        const collectedFlags = Object.values(
          breadcrumbs
        ).flatMap(({ answers }) =>
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

        const responses = Object.entries(breadcrumbs)
          .map(
            ([k, { answers }]: [
              string,
              { answers: string | Array<string> }
            ]) => {
              const question = { id: k, ...flow[k] };

              const questionType = question?.type;

              if (
                !questionType ||
                !SUPPORTED_DECISION_TYPES.includes(questionType)
              )
                return null;

              answers = Array.isArray(answers) ? answers : [answers];

              const selections = answers.map((id) => ({ id, ...flow[id] }));
              const hidden = !selections.some(
                (r) => r.data?.flag && r.data.flag === flag?.value
              );

              return {
                question,
                selections,
                hidden,
              };
            }
          )
          .filter(Boolean);

        const heading =
          (flag.value && overrides && overrides[flag.value]?.heading) ||
          flag.text;
        const description =
          (flag.value && overrides && overrides[flag.value]?.description) ||
          flagSet;

        acc[category] = {
          flag,
          displayText: { heading, description },
          responses: responses.every((r: any) => r.hidden)
            ? responses.map((r: any) => ({ ...r, hidden: false }))
            : responses,
        };

        return acc;
      },
      {}
    );
  },

  updateFlowSettings: async (
    flowSlug: string,
    newSettings: FlowSettings
  ): Promise<any> => {
    let response = await client.mutate({
      mutation: gql`
        mutation UpdateFlowSettings($slug: String, $settings: jsonb) {
          update_flows(
            where: { slug: { _eq: $slug } }
            _set: { settings: $settings }
          ) {
            affected_rows
            returning {
              slug
              settings
            }
          }
        }
      `,
      variables: {
        slug: flowSlug,
        settings: newSettings,
      },
    });

    return response.data.update_flows.affected_rows;
  },
}));

export const useStore = create(vanillaStore);

(window as any)["api"] = useStore;

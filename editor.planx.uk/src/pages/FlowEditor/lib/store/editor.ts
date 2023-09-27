import { gql } from "@apollo/client";
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
import axios from "axios";
import { getCookie } from "lib/cookie";
import { client } from "lib/graphql";
import debounce from "lodash/debounce";
import isEmpty from "lodash/isEmpty";
import omitBy from "lodash/omitBy";
import { customAlphabet } from "nanoid-good";
import en from "nanoid-good/locale/en";
import type { StateCreator } from "zustand";

import { FlowLayout } from "../../components/Flow";
import { connectToDB, getConnection } from "./../sharedb";
import type { Store } from ".";
import type { SharedStore } from "./shared";
import { UserStore } from "./user";

let doc: any;

const send = (ops: Array<any>) => {
  if (ops.length > 0) {
    console.log({ ops });
    doc.submitOp(ops);
  }
};

export interface EditorUIStore {
  flowLayout: FlowLayout;
  showPreview: boolean;
  togglePreview: () => void;
}

export const editorUIStore: StateCreator<
  SharedStore & EditorUIStore,
  [],
  [],
  EditorUIStore
> = (set, get) => ({
  flowLayout: FlowLayout.TOP_DOWN,

  showPreview: true,

  togglePreview: () => {
    set({ showPreview: !get().showPreview });
  },
});

export interface EditorStore extends Store.Store {
  addNode: (node: any, relationships?: any) => void;
  connect: (src: Store.nodeId, tgt: Store.nodeId, object?: any) => void;
  connectTo: (id: Store.nodeId) => void;
  copyFlow: (flowId: string) => Promise<any>;
  copyNode: (id: Store.nodeId) => void;
  createFlow: (teamId: any, newSlug: any) => Promise<string>;
  deleteFlow: (teamId: number, flowSlug: string) => Promise<object>;
  validateAndDiffFlow: (flowId: string) => Promise<any>;
  getFlows: (teamId: number) => Promise<any>;
  isClone: (id: Store.nodeId) => boolean;
  lastPublished: (flowId: string) => Promise<string>;
  lastPublisher: (flowId: string) => Promise<string>;
  makeUnique: (id: Store.nodeId, parent?: Store.nodeId) => void;
  moveFlow: (flowId: string, teamSlug: string) => Promise<any>;
  moveNode: (
    id: Store.nodeId,
    parent?: Store.nodeId,
    toBefore?: Store.nodeId,
    toParent?: Store.nodeId,
  ) => void;
  pasteNode: (toParent: Store.nodeId, toBefore: Store.nodeId) => void;
  publishFlow: (flowId: string, summary?: string) => Promise<any>;
  removeNode: (id: Store.nodeId, parent: Store.nodeId) => void;
  updateNode: (node: any, relationships?: any) => void;
}

export const editorStore: StateCreator<
  SharedStore & EditorStore & UserStore,
  [],
  [],
  EditorStore
> = (set, get) => ({
  addNode: (
    { id = undefined, type, data },
    { children = undefined, parent = ROOT_NODE_KEY, before = undefined } = {},
  ) => {
    const [, ops] = add(
      { id, type, data },
      { children, parent, before },
    )(get().flow);
    send(ops);
  },

  connect: (src, tgt, { before = undefined } = {}) => {
    try {
      const [, ops] = clone(tgt, { toParent: src, toBefore: before })(
        get().flow,
      );
      send(ops);
    } catch (err: any) {
      alert(err.message);
    }
  },

  connectTo: async (id) => {
    if (id === get().id) return; // already connected to this ID

    console.log("connecting to", id, get().id);

    doc = getConnection(id);
    (window as any)["doc"] = doc;

    await connectToDB(doc);

    const cloneStateFromShareDb = () => {
      const flow = JSON.parse(JSON.stringify(doc.data));
      get().setFlow({ id, flow, flowSlug: get().flowSlug });
    };

    // set state from initial load
    cloneStateFromShareDb();

    // local operation so we can assume that multiple ops will arrive
    // almost instantaneously so wait for 100ms of 'silence' before running
    const cloneStateFromLocalOps = debounce(cloneStateFromShareDb, 100);

    // remote operation, there might be network latency so wait for 0.5s
    const cloneStateFromRemoteOps = debounce(cloneStateFromShareDb, 500);

    doc.on("op", (_op: any, isLocalOp?: boolean) =>
      isLocalOp ? cloneStateFromLocalOps() : cloneStateFromRemoteOps(),
    );
  },

  copyFlow: async (flowId: string) => {
    const token = getCookie("jwt");

    // when copying a flow, we make nodeIds unique by replacing part of the original nodeId string.
    //   the onboarding script will often provide a meaningful string reflecting the team name (eg "LAM"),
    //     but when accessed from the editor we generate a string using the same method as in src/@planx/graph/index.ts
    const randomReplacementCharacters = customAlphabet(en)(
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
      5, // a full nodeId is 10 characters long
    );

    return axios.post(
      `${process.env.REACT_APP_API_URL}/flows/${flowId}/copy`,
      {
        replaceValue: randomReplacementCharacters(),
        insert: true,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  copyNode(id) {
    localStorage.setItem("clipboard", id);
  },

  createFlow: async (teamId, newSlug) => {
    const data = { [ROOT_NODE_KEY]: { edges: [] } };
    let response = (await client.mutate({
      mutation: gql`
        mutation CreateFlow($data: jsonb, $slug: String, $teamId: Int) {
          insert_flows_one(
            object: { data: $data, slug: $slug, team_id: $teamId, version: 1 }
          ) {
            id
            data
          }
        }
      `,
      variables: {
        slug: newSlug,
        teamId,
        data,
      },
    })) as any;

    const { id } = response.data.insert_flows_one;

    response = await client.mutate({
      mutation: gql`
        mutation InsertOperation($flow_id: uuid, $data: jsonb) {
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

    return newSlug;
  },

  deleteFlow: async (teamId, flowSlug) => {
    const response = await client.mutate({
      mutation: gql`
        mutation DeleteFlow($team_id: Int, $flow_slug: String) {
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

  validateAndDiffFlow(flowId: string) {
    const token = getCookie("jwt");

    return axios.post(
      `${process.env.REACT_APP_API_URL}/flows/${flowId}/diff`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  getFlows: async (teamId) => {
    client.cache.reset();
    const { data } = await client.query({
      query: gql`
        query GetFlow($teamId: Int!) {
          flows(
            order_by: { updated_at: desc }
            where: { team: { id: { _eq: $teamId } } }
          ) {
            id
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

  isClone: (id) => {
    return isClone(id, get().flow);
  },

  lastPublished: async (flowId: string) => {
    const { data } = await client.query({
      query: gql`
        query GetLastPublishedFlow($id: uuid) {
          flows(limit: 1, where: { id: { _eq: $id } }) {
            published_flows(order_by: { created_at: desc }, limit: 1) {
              created_at
            }
          }
        }
      `,
      variables: {
        id: flowId,
      },
    });

    return data.flows[0].published_flows[0].created_at;
  },

  lastPublisher: async (flowId: string) => {
    const { data } = await client.query({
      query: gql`
        query GetLastPublisher($id: uuid) {
          flows(limit: 1, where: { id: { _eq: $id } }) {
            published_flows(order_by: { created_at: desc }, limit: 1) {
              user {
                first_name
                last_name
              }
            }
          }
        }
      `,
      variables: {
        id: flowId,
      },
    });

    const { first_name, last_name } = data.flows[0].published_flows[0].user;

    return first_name.concat(" ", last_name);
  },

  makeUnique: (id, parent) => {
    const [, ops] = makeUnique(id, parent)(get().flow);
    send(ops);
  },

  moveFlow(flowId: string, teamSlug: string) {
    const valid = get().canUserEditTeam(teamSlug);
    if (!valid) {
      alert(`You do not have permission to move this flow into ${teamSlug}, try again`);
      return Promise.resolve();
    }

    const token = getCookie("jwt");

    return axios
      .post(
        `${process.env.REACT_APP_API_URL}/flows/${flowId}/move/${teamSlug}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .then((res) => alert(res?.data?.message))
      .catch(() =>
        alert(
          "Failed to move this flow. Make sure you're entering a valid team name and try again",
        ),
      );
  },

  moveNode(
    id: string,
    parent = undefined,
    toBefore = undefined,
    toParent = undefined,
  ) {
    try {
      const [, ops] = move(id, parent as unknown as string, {
        toParent,
        toBefore,
      })(get().flow);
      send(ops);
    } catch (err: any) {
      alert(err.message);
    }
  },

  pasteNode(toParent, toBefore) {
    try {
      const id = localStorage.getItem("clipboard");
      if (id) {
        const [, ops] = clone(id, { toParent, toBefore })(get().flow);
        send(ops);
      }
    } catch (err: any) {
      alert(err.message);
    }
  },

  publishFlow(flowId: string, summary?: string) {
    const token = getCookie("jwt");

    const urlWithParams = (url: string, params: any) =>
      [url, new URLSearchParams(omitBy(params, isEmpty))]
        .filter(Boolean)
        .join("?");

    return axios.post(
      urlWithParams(
        `${process.env.REACT_APP_API_URL}/flows/${flowId}/publish`,
        { summary },
      ),
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  removeNode: (id, parent) => {
    const [, ops] = remove(id, parent)(get().flow);
    send(ops);
  },

  updateNode: ({ id, data }, { children = undefined } = {}) => {
    const [, ops] = update(id, data, {
      children,
      removeKeyIfMissing: true,
    })(get().flow);
    send(ops);
  },
});

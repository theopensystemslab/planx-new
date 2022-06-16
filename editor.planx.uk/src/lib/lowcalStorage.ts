import { gql } from "@apollo/client";
import { useStore } from "pages/FlowEditor/lib/store";

import { client } from "./graphql";

let current: string;

class LowcalStorage {
  // /** Returns the number of key/value pairs. */
  // readonly length: number;

  // [name: string]: any;

  // /** Returns the name of the nth key, or null if n is greater than or equal to the number of key/value pairs. */
  // async key(index: number) {
  // }

  // async clear() {}

  getItem = memoize(async (key: string) => {
    console.debug({ getItem: key });
    const id = key.split(":")[1];

    const { data } = await client.query({
      query: gql`
        query GetItem($id: uuid!) {
          lowcal_sessions_by_pk(id: $id) {
            data
          }
        }
      `,
      variables: { id },
      ...getPublicContext(id),
    });

    try {
      current = stringifyWithRootKeysSortedAlphabetically(
        data.lowcal_sessions_by_pk?.data
      );
      return current;
    } catch (err) {
      return undefined;
    }
  });

  removeItem = memoize(async (key: string) => {
    console.debug({ removeItem: key });
    const id = key.split(":")[1];

    await client.mutate({
      mutation: gql`
        mutation SoftDeleteLowcalSession($id: uuid!) {
          update_lowcal_sessions_by_pk(
            pk_columns: { id: $id }
            _set: { deleted_at: "now()" }
          ) {
            id
          }
        }
      `,
      variables: { id },
      ...getPublicContext(id),
    });
  });

  setItem = memoize(async (key: string, value: string) => {
    if (value === current) {
      console.debug("setting what was already retrieved");
      return;
    } else {
      console.debug({ setItem: { key, value }, value, current });
      current = "";
    }

    const id = key.split(":")[1];

    await client.mutate({
      mutation: gql`
        mutation SetItem(
          $data: jsonb!
          $id: uuid!
          $email: String
          $flowId: uuid!
        ) {
          insert_lowcal_sessions_one(
            object: { data: $data, id: $id, email: $email, flow_id: $flowId }
            on_conflict: {
              constraint: lowcal_sessions_pkey
              update_columns: data
            }
          ) {
            id
          }
        }
      `,
      variables: {
        id,
        data: JSON.parse(value),
        email: useStore.getState().saveToEmail,
        flowId: useStore.getState().id,
      },
      ...getPublicContext(id),
    });
  });
}

const memoize = <T extends Function>(fn: T) => {
  let previousArgs: any;
  let cachedResult: any;

  return ((...args: any) => {
    if (
      stringifyWithRootKeysSortedAlphabetically(args) !==
      stringifyWithRootKeysSortedAlphabetically(previousArgs)
    ) {
      previousArgs = args;
      cachedResult = fn(...args);
    }
    return cachedResult;
  }) as unknown as T;
};

export const stringifyWithRootKeysSortedAlphabetically = (
  ob: Record<string, unknown> = {}
) =>
  JSON.stringify(
    Object.keys(ob)
      .sort()
      .reduce(
        (acc, curr) => ({
          ...acc,
          [curr]: ob[curr],
        }),
        {} as typeof ob
      )
  );

/**
 * Generate context for GraphQL client Save & Return requests
 * Hasura "Public" role users need the sessionId and email for lowcal_sessions access
 */
const getPublicContext = (sessionId: string) => ({
  context: {
    headers: {
      "x-hasura-ls-session-id": sessionId,
      "x-hasura-ls-email": useStore.getState().saveToEmail?.toLowerCase(),
    },
  },
});

export const lowcalStorage = new LowcalStorage();

import { gql } from "@apollo/client";
import isEmpty from "lodash/isEmpty";
import { useStore } from "pages/FlowEditor/lib/store";
import { Session } from "types";

import { client } from "./graphql";

let current: string | null;

class LowcalStorage {
  // /** Returns the number of key/value pairs. */
  // readonly length: number;

  // [name: string]: any;

  // /** Returns the name of the nth key, or null if n is greater than or equal to the number of key/value pairs. */
  // async key(index: number) {
  // }

  // async clear() {}

  getItem = memoize(async (key: string): Promise<string | null> => {
    console.debug({ getItem: key });
    const id = getSessionId(key);

    const { data: lowcal_sessions_by_pk } = await client.query({
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
      const session: Session = lowcal_sessions_by_pk?.data;
      if (isEmpty(session)) return null;
      current = stringifyWithRootKeysSortedAlphabetically(session) || null;
      return current;
    } catch (err) {
      return null;
    }
  });

  removeItem = memoize(async (key: string) => {
    console.debug({ removeItem: key });
    const id = getSessionId(key);

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
      current = null;
    }

    const id = getSessionId(key);

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

// XX: This function is also maintained at api.planx.uk/saveAndReturn/utils.js
export const stringifyWithRootKeysSortedAlphabetically = (
  ob: Record<string, unknown> = {}
): string | undefined =>
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
      "x-hasura-lowcal-session-id": sessionId,
      "x-hasura-lowcal-email": useStore.getState().saveToEmail?.toLowerCase(),
    },
  },
});

/**
 * Get sessionId from the key used for lowcalStorage
 */
const getSessionId = (key: string): string => key.split(":")[1];

export const lowcalStorage = new LowcalStorage();

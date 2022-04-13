import { gql } from "@apollo/client";
import stringify from "json-stable-stringify";

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

    const { data } = await client.query({
      query: gql`
        query GetItem($id: uuid!) {
          lowcal_sessions_by_pk(id: $id) {
            data
          }
        }
      `,
      variables: {
        id: key.split(":")[1],
      },
    });

    try {
      current = stringify(data.lowcal_sessions_by_pk?.data);
      return current;
    } catch (err) {
      return undefined;
    }
  });

  removeItem = memoize(async (key: string) => {
    console.debug({ removeItem: key });

    await client.mutate({
      mutation: gql`
        mutation RemoveItem($id: uuid!) {
          delete_lowcal_sessions_by_pk(id: $id) {
            id
          }
        }
      `,
      variables: {
        id: key.split(":")[1],
      },
    });
  });

  setItem = memoize(async (key: string, value: string) => {
    if (value === current) {
      console.log("setting what was already retreived");
      return;
    } else {
      console.debug({ setItem: { key, value }, value, current });
      current = "";
    }

    await client.mutate({
      mutation: gql`
        mutation SetItem($data: jsonb!, $id: uuid!) {
          insert_lowcal_sessions_one(
            object: { data: $data, id: $id }
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
        id: key.split(":")[1],
        data: JSON.parse(value),
      },
    });
  });
}

const memoize = <T extends Function>(fn: T) => {
  let previousArgs: any;
  let cachedResult: any;

  return ((...args: any) => {
    if (stringify(args) !== stringify(previousArgs)) {
      previousArgs = args;
      cachedResult = fn(...args);
    }
    return cachedResult;
  }) as unknown as T;
};

export const lowcalStorage = new LowcalStorage();

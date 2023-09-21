import { DELETE_FLOW_QUERY, INSERT_FLOW_QUERY, UPDATE_FLOW_QUERY } from "./flows";
import { SELECT_USERS_QUERY } from "./users";

export const queries = {
  flows: {
    insert: INSERT_FLOW_QUERY,
    update: UPDATE_FLOW_QUERY,
    delete: DELETE_FLOW_QUERY,
  },
  users: {
    select: SELECT_USERS_QUERY,
  }
} as const;

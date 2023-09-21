import { DELETE_FLOW_QUERY, INSERT_FLOW_QUERY, UPDATE_FLOW_QUERY } from "./flows";
import { INSERT_PUBLISHED_FLOW_QUERY } from "./publishedFlows";
import { SELECT_USERS_QUERY } from "./users";

export const queries = {
  flows: {
    insert: INSERT_FLOW_QUERY,
    update: UPDATE_FLOW_QUERY,
    delete: DELETE_FLOW_QUERY,
  },
  users: {
    select: SELECT_USERS_QUERY,
  },
  published_flows: {
    insert: INSERT_PUBLISHED_FLOW_QUERY,
  }
} as const;

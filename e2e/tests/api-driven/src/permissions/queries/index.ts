import { DELETE_FLOW_QUERY, INSERT_FLOW_QUERY, UPDATE_FLOW_QUERY } from "./flows";

export const queries = {
  flows: {
    insert: INSERT_FLOW_QUERY,
    update: UPDATE_FLOW_QUERY,
    delete: DELETE_FLOW_QUERY,
  },
} as const;

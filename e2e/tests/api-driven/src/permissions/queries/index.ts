import {
  DELETE_FLOW_QUERY,
  INSERT_FLOW_QUERY,
  UPDATE_FLOW_QUERY,
} from "./flows.js";
import {
  INSERT_OPERATION_QUERY,
  UPDATE_OPERATION_QUERY,
} from "./operations.js";
import { INSERT_PUBLISHED_FLOW_QUERY } from "./publishedFlows.js";
import { SELECT_TEAM_MEMBERS_QUERY } from "./teamMembers.js";
import { SELECT_USERS_QUERY } from "./users.js";

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
  },
  team_members: {
    select: SELECT_TEAM_MEMBERS_QUERY,
  },
  operations: {
    insert: INSERT_OPERATION_QUERY,
    update: UPDATE_OPERATION_QUERY,
  },
} as const;

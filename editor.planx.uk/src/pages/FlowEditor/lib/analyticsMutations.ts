import { gql } from "@apollo/client";

export const INSERT_NEW_ANALYTICS_LOG = gql`
  mutation InsertNewAnalyticsLog(
    $flow_direction: String
    $analytics_id: bigint
    $metadata: jsonb
    $node_type: String
    $node_title: String
    $node_id: String
  ) {
    insert_analytics_logs_one(
      object: {
        flow_direction: $flow_direction
        analytics_id: $analytics_id
        user_exit: false
        metadata: $metadata
        node_type: $node_type
        node_title: $node_title
        node_id: $node_id
      }
    ) {
      id
      created_at
    }
  }
`;

export const UPDATE_NEXT_LOG_CREATED_AT = gql`
  mutation UpdateAnalyticsLogsByPk(
    $id: bigint!
    $next_log_created_at: timestamptz
  ) {
    update_analytics_logs_by_pk(
      pk_columns: { id: $id }
      _set: { next_log_created_at: $next_log_created_at }
    ) {
      id
    }
  }
`;

export const UPDATE_HAS_CLICKED_HELP = gql`
  mutation UpdateHasClickedHelp($id: bigint!, $metadata: jsonb = {}) {
    update_analytics_logs_by_pk(
      pk_columns: { id: $id }
      _set: { has_clicked_help: true }
      _append: { metadata: $metadata }
    ) {
      id
    }
  }
`;

export const UPDATE_ANALYTICS_LOG_METADATA = gql`
  mutation UpdateAnalyticsLogMetadata($id: bigint!, $metadata: jsonb = {}) {
    update_analytics_logs_by_pk(
      pk_columns: { id: $id }
      _append: { metadata: $metadata }
    ) {
      id
    }
  }
`;

export const UPDATE_FLOW_DIRECTION = gql`
  mutation UpdateFlowDirection($id: bigint!, $flow_direction: String) {
    update_analytics_logs_by_pk(
      pk_columns: { id: $id }
      _set: { flow_direction: $flow_direction }
    ) {
      id
    }
  }
`;

export const INSERT_NEW_ANALYTICS = gql`
  mutation InsertNewAnalytics(
    $type: String
    $flow_id: uuid
    $user_agent: jsonb
    $referrer: String
  ) {
    insert_analytics_one(
      object: {
        type: $type
        flow_id: $flow_id
        user_agent: $user_agent
        referrer: $referrer
      }
    ) {
      id
    }
  }
`;

export const UPDATE_ALLOW_LIST_ANSWERS = gql`
  mutation UpdateAllowListAnswers(
    $id: bigint!
    $allow_list_answers: jsonb
    $node_id: String!
  ) {
    update_analytics_logs(
      where: { id: { _eq: $id }, node_id: { _eq: $node_id } }
      _set: { allow_list_answers: $allow_list_answers }
    ) {
      returning {
        id
      }
    }
  }
`;

export const TRACK_INPUT_ERRORS = gql`
  mutation TrackInputErrors($id: bigint!, $error: jsonb) {
    update_analytics_logs_by_pk(
      pk_columns: { id: $id }
      _append: { input_errors: $error }
    ) {
      id
    }
  }
`;

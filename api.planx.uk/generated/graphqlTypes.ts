export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  bigint: any;
  jsonb: any;
  timestamptz: any;
  uuid: any;
};

/** Boolean expression to compare columns of type "Boolean". All fields are combined with logical 'AND'. */
export type Boolean_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Boolean']>;
  _gt?: InputMaybe<Scalars['Boolean']>;
  _gte?: InputMaybe<Scalars['Boolean']>;
  _in?: InputMaybe<Array<Scalars['Boolean']>>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  _lt?: InputMaybe<Scalars['Boolean']>;
  _lte?: InputMaybe<Scalars['Boolean']>;
  _neq?: InputMaybe<Scalars['Boolean']>;
  _nin?: InputMaybe<Array<Scalars['Boolean']>>;
};

/** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
export type Int_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Int']>;
  _gt?: InputMaybe<Scalars['Int']>;
  _gte?: InputMaybe<Scalars['Int']>;
  _in?: InputMaybe<Array<Scalars['Int']>>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  _lt?: InputMaybe<Scalars['Int']>;
  _lte?: InputMaybe<Scalars['Int']>;
  _neq?: InputMaybe<Scalars['Int']>;
  _nin?: InputMaybe<Array<Scalars['Int']>>;
};

/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
export type String_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['String']>;
  _gt?: InputMaybe<Scalars['String']>;
  _gte?: InputMaybe<Scalars['String']>;
  /** does the column match the given case-insensitive pattern */
  _ilike?: InputMaybe<Scalars['String']>;
  _in?: InputMaybe<Array<Scalars['String']>>;
  /** does the column match the given POSIX regular expression, case insensitive */
  _iregex?: InputMaybe<Scalars['String']>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  /** does the column match the given pattern */
  _like?: InputMaybe<Scalars['String']>;
  _lt?: InputMaybe<Scalars['String']>;
  _lte?: InputMaybe<Scalars['String']>;
  _neq?: InputMaybe<Scalars['String']>;
  /** does the column NOT match the given case-insensitive pattern */
  _nilike?: InputMaybe<Scalars['String']>;
  _nin?: InputMaybe<Array<Scalars['String']>>;
  /** does the column NOT match the given POSIX regular expression, case insensitive */
  _niregex?: InputMaybe<Scalars['String']>;
  /** does the column NOT match the given pattern */
  _nlike?: InputMaybe<Scalars['String']>;
  /** does the column NOT match the given POSIX regular expression, case sensitive */
  _nregex?: InputMaybe<Scalars['String']>;
  /** does the column NOT match the given SQL regular expression */
  _nsimilar?: InputMaybe<Scalars['String']>;
  /** does the column match the given POSIX regular expression, case sensitive */
  _regex?: InputMaybe<Scalars['String']>;
  /** does the column match the given SQL regular expression */
  _similar?: InputMaybe<Scalars['String']>;
};

/** Anonymously tracks user's initial or resumed visits across all `flows`, then visualized in Metabase */
export type Analytics = {
  __typename?: 'analytics';
  created_at: Scalars['timestamptz'];
  ended_at?: Maybe<Scalars['timestamptz']>;
  flow_id: Scalars['uuid'];
  id: Scalars['bigint'];
  type: Scalars['String'];
};

/** aggregated selection of "analytics" */
export type Analytics_Aggregate = {
  __typename?: 'analytics_aggregate';
  aggregate?: Maybe<Analytics_Aggregate_Fields>;
  nodes: Array<Analytics>;
};

/** aggregate fields of "analytics" */
export type Analytics_Aggregate_Fields = {
  __typename?: 'analytics_aggregate_fields';
  avg?: Maybe<Analytics_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<Analytics_Max_Fields>;
  min?: Maybe<Analytics_Min_Fields>;
  stddev?: Maybe<Analytics_Stddev_Fields>;
  stddev_pop?: Maybe<Analytics_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Analytics_Stddev_Samp_Fields>;
  sum?: Maybe<Analytics_Sum_Fields>;
  var_pop?: Maybe<Analytics_Var_Pop_Fields>;
  var_samp?: Maybe<Analytics_Var_Samp_Fields>;
  variance?: Maybe<Analytics_Variance_Fields>;
};


/** aggregate fields of "analytics" */
export type Analytics_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Analytics_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** aggregate avg on columns */
export type Analytics_Avg_Fields = {
  __typename?: 'analytics_avg_fields';
  id?: Maybe<Scalars['Float']>;
};

/** Boolean expression to filter rows from the table "analytics". All fields are combined with a logical 'AND'. */
export type Analytics_Bool_Exp = {
  _and?: InputMaybe<Array<Analytics_Bool_Exp>>;
  _not?: InputMaybe<Analytics_Bool_Exp>;
  _or?: InputMaybe<Array<Analytics_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  ended_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  flow_id?: InputMaybe<Uuid_Comparison_Exp>;
  id?: InputMaybe<Bigint_Comparison_Exp>;
  type?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "analytics" */
export enum Analytics_Constraint {
  /** unique or primary key constraint on columns "id" */
  AnalyticsPkey = 'analytics_pkey'
}

/** input type for incrementing numeric columns in table "analytics" */
export type Analytics_Inc_Input = {
  id?: InputMaybe<Scalars['bigint']>;
};

/** input type for inserting data into table "analytics" */
export type Analytics_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']>;
  ended_at?: InputMaybe<Scalars['timestamptz']>;
  flow_id?: InputMaybe<Scalars['uuid']>;
  id?: InputMaybe<Scalars['bigint']>;
  type?: InputMaybe<Scalars['String']>;
};

/** Links to `analytics` to provide granular details about user interactions with individual questions */
export type Analytics_Logs = {
  __typename?: 'analytics_logs';
  analytics_id: Scalars['Int'];
  created_at: Scalars['timestamptz'];
  flow_direction: Scalars['String'];
  has_clicked_help: Scalars['Boolean'];
  id: Scalars['bigint'];
  metadata: Scalars['jsonb'];
  node_title?: Maybe<Scalars['String']>;
  node_type?: Maybe<Scalars['Int']>;
  user_exit: Scalars['Boolean'];
};


/** Links to `analytics` to provide granular details about user interactions with individual questions */
export type Analytics_LogsMetadataArgs = {
  path?: InputMaybe<Scalars['String']>;
};

/** aggregated selection of "analytics_logs" */
export type Analytics_Logs_Aggregate = {
  __typename?: 'analytics_logs_aggregate';
  aggregate?: Maybe<Analytics_Logs_Aggregate_Fields>;
  nodes: Array<Analytics_Logs>;
};

/** aggregate fields of "analytics_logs" */
export type Analytics_Logs_Aggregate_Fields = {
  __typename?: 'analytics_logs_aggregate_fields';
  avg?: Maybe<Analytics_Logs_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<Analytics_Logs_Max_Fields>;
  min?: Maybe<Analytics_Logs_Min_Fields>;
  stddev?: Maybe<Analytics_Logs_Stddev_Fields>;
  stddev_pop?: Maybe<Analytics_Logs_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Analytics_Logs_Stddev_Samp_Fields>;
  sum?: Maybe<Analytics_Logs_Sum_Fields>;
  var_pop?: Maybe<Analytics_Logs_Var_Pop_Fields>;
  var_samp?: Maybe<Analytics_Logs_Var_Samp_Fields>;
  variance?: Maybe<Analytics_Logs_Variance_Fields>;
};


/** aggregate fields of "analytics_logs" */
export type Analytics_Logs_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Analytics_Logs_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Analytics_Logs_Append_Input = {
  metadata?: InputMaybe<Scalars['jsonb']>;
};

/** aggregate avg on columns */
export type Analytics_Logs_Avg_Fields = {
  __typename?: 'analytics_logs_avg_fields';
  analytics_id?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  node_type?: Maybe<Scalars['Float']>;
};

/** Boolean expression to filter rows from the table "analytics_logs". All fields are combined with a logical 'AND'. */
export type Analytics_Logs_Bool_Exp = {
  _and?: InputMaybe<Array<Analytics_Logs_Bool_Exp>>;
  _not?: InputMaybe<Analytics_Logs_Bool_Exp>;
  _or?: InputMaybe<Array<Analytics_Logs_Bool_Exp>>;
  analytics_id?: InputMaybe<Int_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  flow_direction?: InputMaybe<String_Comparison_Exp>;
  has_clicked_help?: InputMaybe<Boolean_Comparison_Exp>;
  id?: InputMaybe<Bigint_Comparison_Exp>;
  metadata?: InputMaybe<Jsonb_Comparison_Exp>;
  node_title?: InputMaybe<String_Comparison_Exp>;
  node_type?: InputMaybe<Int_Comparison_Exp>;
  user_exit?: InputMaybe<Boolean_Comparison_Exp>;
};

/** unique or primary key constraints on table "analytics_logs" */
export enum Analytics_Logs_Constraint {
  /** unique or primary key constraint on columns "id" */
  AnalyticsLogsPkey = 'analytics_logs_pkey'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Analytics_Logs_Delete_At_Path_Input = {
  metadata?: InputMaybe<Array<Scalars['String']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Analytics_Logs_Delete_Elem_Input = {
  metadata?: InputMaybe<Scalars['Int']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Analytics_Logs_Delete_Key_Input = {
  metadata?: InputMaybe<Scalars['String']>;
};

/** input type for incrementing numeric columns in table "analytics_logs" */
export type Analytics_Logs_Inc_Input = {
  analytics_id?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['bigint']>;
  node_type?: InputMaybe<Scalars['Int']>;
};

/** input type for inserting data into table "analytics_logs" */
export type Analytics_Logs_Insert_Input = {
  analytics_id?: InputMaybe<Scalars['Int']>;
  created_at?: InputMaybe<Scalars['timestamptz']>;
  flow_direction?: InputMaybe<Scalars['String']>;
  has_clicked_help?: InputMaybe<Scalars['Boolean']>;
  id?: InputMaybe<Scalars['bigint']>;
  metadata?: InputMaybe<Scalars['jsonb']>;
  node_title?: InputMaybe<Scalars['String']>;
  node_type?: InputMaybe<Scalars['Int']>;
  user_exit?: InputMaybe<Scalars['Boolean']>;
};

/** aggregate max on columns */
export type Analytics_Logs_Max_Fields = {
  __typename?: 'analytics_logs_max_fields';
  analytics_id?: Maybe<Scalars['Int']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  flow_direction?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['bigint']>;
  node_title?: Maybe<Scalars['String']>;
  node_type?: Maybe<Scalars['Int']>;
};

/** aggregate min on columns */
export type Analytics_Logs_Min_Fields = {
  __typename?: 'analytics_logs_min_fields';
  analytics_id?: Maybe<Scalars['Int']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  flow_direction?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['bigint']>;
  node_title?: Maybe<Scalars['String']>;
  node_type?: Maybe<Scalars['Int']>;
};

/** response of any mutation on the table "analytics_logs" */
export type Analytics_Logs_Mutation_Response = {
  __typename?: 'analytics_logs_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Analytics_Logs>;
};

/** on_conflict condition type for table "analytics_logs" */
export type Analytics_Logs_On_Conflict = {
  constraint: Analytics_Logs_Constraint;
  update_columns?: Array<Analytics_Logs_Update_Column>;
  where?: InputMaybe<Analytics_Logs_Bool_Exp>;
};

/** Ordering options when selecting data from "analytics_logs". */
export type Analytics_Logs_Order_By = {
  analytics_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  flow_direction?: InputMaybe<Order_By>;
  has_clicked_help?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  metadata?: InputMaybe<Order_By>;
  node_title?: InputMaybe<Order_By>;
  node_type?: InputMaybe<Order_By>;
  user_exit?: InputMaybe<Order_By>;
};

/** primary key columns input for table: analytics_logs */
export type Analytics_Logs_Pk_Columns_Input = {
  id: Scalars['bigint'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Analytics_Logs_Prepend_Input = {
  metadata?: InputMaybe<Scalars['jsonb']>;
};

/** select columns of table "analytics_logs" */
export enum Analytics_Logs_Select_Column {
  /** column name */
  AnalyticsId = 'analytics_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  FlowDirection = 'flow_direction',
  /** column name */
  HasClickedHelp = 'has_clicked_help',
  /** column name */
  Id = 'id',
  /** column name */
  Metadata = 'metadata',
  /** column name */
  NodeTitle = 'node_title',
  /** column name */
  NodeType = 'node_type',
  /** column name */
  UserExit = 'user_exit'
}

/** input type for updating data in table "analytics_logs" */
export type Analytics_Logs_Set_Input = {
  analytics_id?: InputMaybe<Scalars['Int']>;
  created_at?: InputMaybe<Scalars['timestamptz']>;
  flow_direction?: InputMaybe<Scalars['String']>;
  has_clicked_help?: InputMaybe<Scalars['Boolean']>;
  id?: InputMaybe<Scalars['bigint']>;
  metadata?: InputMaybe<Scalars['jsonb']>;
  node_title?: InputMaybe<Scalars['String']>;
  node_type?: InputMaybe<Scalars['Int']>;
  user_exit?: InputMaybe<Scalars['Boolean']>;
};

/** aggregate stddev on columns */
export type Analytics_Logs_Stddev_Fields = {
  __typename?: 'analytics_logs_stddev_fields';
  analytics_id?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  node_type?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_pop on columns */
export type Analytics_Logs_Stddev_Pop_Fields = {
  __typename?: 'analytics_logs_stddev_pop_fields';
  analytics_id?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  node_type?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_samp on columns */
export type Analytics_Logs_Stddev_Samp_Fields = {
  __typename?: 'analytics_logs_stddev_samp_fields';
  analytics_id?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  node_type?: Maybe<Scalars['Float']>;
};

/** aggregate sum on columns */
export type Analytics_Logs_Sum_Fields = {
  __typename?: 'analytics_logs_sum_fields';
  analytics_id?: Maybe<Scalars['Int']>;
  id?: Maybe<Scalars['bigint']>;
  node_type?: Maybe<Scalars['Int']>;
};

/** update columns of table "analytics_logs" */
export enum Analytics_Logs_Update_Column {
  /** column name */
  AnalyticsId = 'analytics_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  FlowDirection = 'flow_direction',
  /** column name */
  HasClickedHelp = 'has_clicked_help',
  /** column name */
  Id = 'id',
  /** column name */
  Metadata = 'metadata',
  /** column name */
  NodeTitle = 'node_title',
  /** column name */
  NodeType = 'node_type',
  /** column name */
  UserExit = 'user_exit'
}

/** aggregate var_pop on columns */
export type Analytics_Logs_Var_Pop_Fields = {
  __typename?: 'analytics_logs_var_pop_fields';
  analytics_id?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  node_type?: Maybe<Scalars['Float']>;
};

/** aggregate var_samp on columns */
export type Analytics_Logs_Var_Samp_Fields = {
  __typename?: 'analytics_logs_var_samp_fields';
  analytics_id?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  node_type?: Maybe<Scalars['Float']>;
};

/** aggregate variance on columns */
export type Analytics_Logs_Variance_Fields = {
  __typename?: 'analytics_logs_variance_fields';
  analytics_id?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  node_type?: Maybe<Scalars['Float']>;
};

/** aggregate max on columns */
export type Analytics_Max_Fields = {
  __typename?: 'analytics_max_fields';
  created_at?: Maybe<Scalars['timestamptz']>;
  ended_at?: Maybe<Scalars['timestamptz']>;
  flow_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['bigint']>;
  type?: Maybe<Scalars['String']>;
};

/** aggregate min on columns */
export type Analytics_Min_Fields = {
  __typename?: 'analytics_min_fields';
  created_at?: Maybe<Scalars['timestamptz']>;
  ended_at?: Maybe<Scalars['timestamptz']>;
  flow_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['bigint']>;
  type?: Maybe<Scalars['String']>;
};

/** response of any mutation on the table "analytics" */
export type Analytics_Mutation_Response = {
  __typename?: 'analytics_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Analytics>;
};

/** on_conflict condition type for table "analytics" */
export type Analytics_On_Conflict = {
  constraint: Analytics_Constraint;
  update_columns?: Array<Analytics_Update_Column>;
  where?: InputMaybe<Analytics_Bool_Exp>;
};

/** Ordering options when selecting data from "analytics". */
export type Analytics_Order_By = {
  created_at?: InputMaybe<Order_By>;
  ended_at?: InputMaybe<Order_By>;
  flow_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  type?: InputMaybe<Order_By>;
};

/** primary key columns input for table: analytics */
export type Analytics_Pk_Columns_Input = {
  id: Scalars['bigint'];
};

/** select columns of table "analytics" */
export enum Analytics_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  EndedAt = 'ended_at',
  /** column name */
  FlowId = 'flow_id',
  /** column name */
  Id = 'id',
  /** column name */
  Type = 'type'
}

/** input type for updating data in table "analytics" */
export type Analytics_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']>;
  ended_at?: InputMaybe<Scalars['timestamptz']>;
  flow_id?: InputMaybe<Scalars['uuid']>;
  id?: InputMaybe<Scalars['bigint']>;
  type?: InputMaybe<Scalars['String']>;
};

/** aggregate stddev on columns */
export type Analytics_Stddev_Fields = {
  __typename?: 'analytics_stddev_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_pop on columns */
export type Analytics_Stddev_Pop_Fields = {
  __typename?: 'analytics_stddev_pop_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_samp on columns */
export type Analytics_Stddev_Samp_Fields = {
  __typename?: 'analytics_stddev_samp_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate sum on columns */
export type Analytics_Sum_Fields = {
  __typename?: 'analytics_sum_fields';
  id?: Maybe<Scalars['bigint']>;
};

/** update columns of table "analytics" */
export enum Analytics_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  EndedAt = 'ended_at',
  /** column name */
  FlowId = 'flow_id',
  /** column name */
  Id = 'id',
  /** column name */
  Type = 'type'
}

/** aggregate var_pop on columns */
export type Analytics_Var_Pop_Fields = {
  __typename?: 'analytics_var_pop_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate var_samp on columns */
export type Analytics_Var_Samp_Fields = {
  __typename?: 'analytics_var_samp_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate variance on columns */
export type Analytics_Variance_Fields = {
  __typename?: 'analytics_variance_fields';
  id?: Maybe<Scalars['Float']>;
};

/** Boolean expression to compare columns of type "bigint". All fields are combined with logical 'AND'. */
export type Bigint_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['bigint']>;
  _gt?: InputMaybe<Scalars['bigint']>;
  _gte?: InputMaybe<Scalars['bigint']>;
  _in?: InputMaybe<Array<Scalars['bigint']>>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  _lt?: InputMaybe<Scalars['bigint']>;
  _lte?: InputMaybe<Scalars['bigint']>;
  _neq?: InputMaybe<Scalars['bigint']>;
  _nin?: InputMaybe<Array<Scalars['bigint']>>;
};

/** Translates BLPU codes into PlanX data field values */
export type Blpu_Codes = {
  __typename?: 'blpu_codes';
  code: Scalars['String'];
  description: Scalars['String'];
  value?: Maybe<Scalars['String']>;
};

/** aggregated selection of "blpu_codes" */
export type Blpu_Codes_Aggregate = {
  __typename?: 'blpu_codes_aggregate';
  aggregate?: Maybe<Blpu_Codes_Aggregate_Fields>;
  nodes: Array<Blpu_Codes>;
};

/** aggregate fields of "blpu_codes" */
export type Blpu_Codes_Aggregate_Fields = {
  __typename?: 'blpu_codes_aggregate_fields';
  count: Scalars['Int'];
  max?: Maybe<Blpu_Codes_Max_Fields>;
  min?: Maybe<Blpu_Codes_Min_Fields>;
};


/** aggregate fields of "blpu_codes" */
export type Blpu_Codes_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Blpu_Codes_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** Boolean expression to filter rows from the table "blpu_codes". All fields are combined with a logical 'AND'. */
export type Blpu_Codes_Bool_Exp = {
  _and?: InputMaybe<Array<Blpu_Codes_Bool_Exp>>;
  _not?: InputMaybe<Blpu_Codes_Bool_Exp>;
  _or?: InputMaybe<Array<Blpu_Codes_Bool_Exp>>;
  code?: InputMaybe<String_Comparison_Exp>;
  description?: InputMaybe<String_Comparison_Exp>;
  value?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "blpu_codes" */
export enum Blpu_Codes_Constraint {
  /** unique or primary key constraint on columns "code" */
  BlpuCodesPkey = 'blpu_codes_pkey'
}

/** input type for inserting data into table "blpu_codes" */
export type Blpu_Codes_Insert_Input = {
  code?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  value?: InputMaybe<Scalars['String']>;
};

/** aggregate max on columns */
export type Blpu_Codes_Max_Fields = {
  __typename?: 'blpu_codes_max_fields';
  code?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

/** aggregate min on columns */
export type Blpu_Codes_Min_Fields = {
  __typename?: 'blpu_codes_min_fields';
  code?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

/** response of any mutation on the table "blpu_codes" */
export type Blpu_Codes_Mutation_Response = {
  __typename?: 'blpu_codes_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Blpu_Codes>;
};

/** on_conflict condition type for table "blpu_codes" */
export type Blpu_Codes_On_Conflict = {
  constraint: Blpu_Codes_Constraint;
  update_columns?: Array<Blpu_Codes_Update_Column>;
  where?: InputMaybe<Blpu_Codes_Bool_Exp>;
};

/** Ordering options when selecting data from "blpu_codes". */
export type Blpu_Codes_Order_By = {
  code?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** primary key columns input for table: blpu_codes */
export type Blpu_Codes_Pk_Columns_Input = {
  code: Scalars['String'];
};

/** select columns of table "blpu_codes" */
export enum Blpu_Codes_Select_Column {
  /** column name */
  Code = 'code',
  /** column name */
  Description = 'description',
  /** column name */
  Value = 'value'
}

/** input type for updating data in table "blpu_codes" */
export type Blpu_Codes_Set_Input = {
  code?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  value?: InputMaybe<Scalars['String']>;
};

/** update columns of table "blpu_codes" */
export enum Blpu_Codes_Update_Column {
  /** column name */
  Code = 'code',
  /** column name */
  Description = 'description',
  /** column name */
  Value = 'value'
}

/** Stores a receipt of applications submitted to the Back Office Planning System (BOPS) */
export type Bops_Applications = {
  __typename?: 'bops_applications';
  bops_id: Scalars['String'];
  created_at: Scalars['timestamptz'];
  destination_url: Scalars['String'];
  id: Scalars['Int'];
  req_headers: Scalars['jsonb'];
  request: Scalars['jsonb'];
  response: Scalars['jsonb'];
  response_headers?: Maybe<Scalars['jsonb']>;
  session_id: Scalars['String'];
};


/** Stores a receipt of applications submitted to the Back Office Planning System (BOPS) */
export type Bops_ApplicationsReq_HeadersArgs = {
  path?: InputMaybe<Scalars['String']>;
};


/** Stores a receipt of applications submitted to the Back Office Planning System (BOPS) */
export type Bops_ApplicationsRequestArgs = {
  path?: InputMaybe<Scalars['String']>;
};


/** Stores a receipt of applications submitted to the Back Office Planning System (BOPS) */
export type Bops_ApplicationsResponseArgs = {
  path?: InputMaybe<Scalars['String']>;
};


/** Stores a receipt of applications submitted to the Back Office Planning System (BOPS) */
export type Bops_ApplicationsResponse_HeadersArgs = {
  path?: InputMaybe<Scalars['String']>;
};

/** aggregated selection of "bops_applications" */
export type Bops_Applications_Aggregate = {
  __typename?: 'bops_applications_aggregate';
  aggregate?: Maybe<Bops_Applications_Aggregate_Fields>;
  nodes: Array<Bops_Applications>;
};

/** aggregate fields of "bops_applications" */
export type Bops_Applications_Aggregate_Fields = {
  __typename?: 'bops_applications_aggregate_fields';
  avg?: Maybe<Bops_Applications_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<Bops_Applications_Max_Fields>;
  min?: Maybe<Bops_Applications_Min_Fields>;
  stddev?: Maybe<Bops_Applications_Stddev_Fields>;
  stddev_pop?: Maybe<Bops_Applications_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Bops_Applications_Stddev_Samp_Fields>;
  sum?: Maybe<Bops_Applications_Sum_Fields>;
  var_pop?: Maybe<Bops_Applications_Var_Pop_Fields>;
  var_samp?: Maybe<Bops_Applications_Var_Samp_Fields>;
  variance?: Maybe<Bops_Applications_Variance_Fields>;
};


/** aggregate fields of "bops_applications" */
export type Bops_Applications_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Bops_Applications_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Bops_Applications_Append_Input = {
  req_headers?: InputMaybe<Scalars['jsonb']>;
  request?: InputMaybe<Scalars['jsonb']>;
  response?: InputMaybe<Scalars['jsonb']>;
  response_headers?: InputMaybe<Scalars['jsonb']>;
};

/** aggregate avg on columns */
export type Bops_Applications_Avg_Fields = {
  __typename?: 'bops_applications_avg_fields';
  id?: Maybe<Scalars['Float']>;
};

/** Boolean expression to filter rows from the table "bops_applications". All fields are combined with a logical 'AND'. */
export type Bops_Applications_Bool_Exp = {
  _and?: InputMaybe<Array<Bops_Applications_Bool_Exp>>;
  _not?: InputMaybe<Bops_Applications_Bool_Exp>;
  _or?: InputMaybe<Array<Bops_Applications_Bool_Exp>>;
  bops_id?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  destination_url?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  req_headers?: InputMaybe<Jsonb_Comparison_Exp>;
  request?: InputMaybe<Jsonb_Comparison_Exp>;
  response?: InputMaybe<Jsonb_Comparison_Exp>;
  response_headers?: InputMaybe<Jsonb_Comparison_Exp>;
  session_id?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "bops_applications" */
export enum Bops_Applications_Constraint {
  /** unique or primary key constraint on columns "id" */
  BopsApplicationsPkey = 'bops_applications_pkey'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Bops_Applications_Delete_At_Path_Input = {
  req_headers?: InputMaybe<Array<Scalars['String']>>;
  request?: InputMaybe<Array<Scalars['String']>>;
  response?: InputMaybe<Array<Scalars['String']>>;
  response_headers?: InputMaybe<Array<Scalars['String']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Bops_Applications_Delete_Elem_Input = {
  req_headers?: InputMaybe<Scalars['Int']>;
  request?: InputMaybe<Scalars['Int']>;
  response?: InputMaybe<Scalars['Int']>;
  response_headers?: InputMaybe<Scalars['Int']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Bops_Applications_Delete_Key_Input = {
  req_headers?: InputMaybe<Scalars['String']>;
  request?: InputMaybe<Scalars['String']>;
  response?: InputMaybe<Scalars['String']>;
  response_headers?: InputMaybe<Scalars['String']>;
};

/** input type for incrementing numeric columns in table "bops_applications" */
export type Bops_Applications_Inc_Input = {
  id?: InputMaybe<Scalars['Int']>;
};

/** input type for inserting data into table "bops_applications" */
export type Bops_Applications_Insert_Input = {
  bops_id?: InputMaybe<Scalars['String']>;
  created_at?: InputMaybe<Scalars['timestamptz']>;
  destination_url?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Int']>;
  req_headers?: InputMaybe<Scalars['jsonb']>;
  request?: InputMaybe<Scalars['jsonb']>;
  response?: InputMaybe<Scalars['jsonb']>;
  response_headers?: InputMaybe<Scalars['jsonb']>;
  session_id?: InputMaybe<Scalars['String']>;
};

/** aggregate max on columns */
export type Bops_Applications_Max_Fields = {
  __typename?: 'bops_applications_max_fields';
  bops_id?: Maybe<Scalars['String']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  destination_url?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Int']>;
  session_id?: Maybe<Scalars['String']>;
};

/** aggregate min on columns */
export type Bops_Applications_Min_Fields = {
  __typename?: 'bops_applications_min_fields';
  bops_id?: Maybe<Scalars['String']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  destination_url?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Int']>;
  session_id?: Maybe<Scalars['String']>;
};

/** response of any mutation on the table "bops_applications" */
export type Bops_Applications_Mutation_Response = {
  __typename?: 'bops_applications_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Bops_Applications>;
};

/** on_conflict condition type for table "bops_applications" */
export type Bops_Applications_On_Conflict = {
  constraint: Bops_Applications_Constraint;
  update_columns?: Array<Bops_Applications_Update_Column>;
  where?: InputMaybe<Bops_Applications_Bool_Exp>;
};

/** Ordering options when selecting data from "bops_applications". */
export type Bops_Applications_Order_By = {
  bops_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  destination_url?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  req_headers?: InputMaybe<Order_By>;
  request?: InputMaybe<Order_By>;
  response?: InputMaybe<Order_By>;
  response_headers?: InputMaybe<Order_By>;
  session_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: bops_applications */
export type Bops_Applications_Pk_Columns_Input = {
  id: Scalars['Int'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Bops_Applications_Prepend_Input = {
  req_headers?: InputMaybe<Scalars['jsonb']>;
  request?: InputMaybe<Scalars['jsonb']>;
  response?: InputMaybe<Scalars['jsonb']>;
  response_headers?: InputMaybe<Scalars['jsonb']>;
};

/** select columns of table "bops_applications" */
export enum Bops_Applications_Select_Column {
  /** column name */
  BopsId = 'bops_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DestinationUrl = 'destination_url',
  /** column name */
  Id = 'id',
  /** column name */
  ReqHeaders = 'req_headers',
  /** column name */
  Request = 'request',
  /** column name */
  Response = 'response',
  /** column name */
  ResponseHeaders = 'response_headers',
  /** column name */
  SessionId = 'session_id'
}

/** input type for updating data in table "bops_applications" */
export type Bops_Applications_Set_Input = {
  bops_id?: InputMaybe<Scalars['String']>;
  created_at?: InputMaybe<Scalars['timestamptz']>;
  destination_url?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Int']>;
  req_headers?: InputMaybe<Scalars['jsonb']>;
  request?: InputMaybe<Scalars['jsonb']>;
  response?: InputMaybe<Scalars['jsonb']>;
  response_headers?: InputMaybe<Scalars['jsonb']>;
  session_id?: InputMaybe<Scalars['String']>;
};

/** aggregate stddev on columns */
export type Bops_Applications_Stddev_Fields = {
  __typename?: 'bops_applications_stddev_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_pop on columns */
export type Bops_Applications_Stddev_Pop_Fields = {
  __typename?: 'bops_applications_stddev_pop_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_samp on columns */
export type Bops_Applications_Stddev_Samp_Fields = {
  __typename?: 'bops_applications_stddev_samp_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate sum on columns */
export type Bops_Applications_Sum_Fields = {
  __typename?: 'bops_applications_sum_fields';
  id?: Maybe<Scalars['Int']>;
};

/** update columns of table "bops_applications" */
export enum Bops_Applications_Update_Column {
  /** column name */
  BopsId = 'bops_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DestinationUrl = 'destination_url',
  /** column name */
  Id = 'id',
  /** column name */
  ReqHeaders = 'req_headers',
  /** column name */
  Request = 'request',
  /** column name */
  Response = 'response',
  /** column name */
  ResponseHeaders = 'response_headers',
  /** column name */
  SessionId = 'session_id'
}

/** aggregate var_pop on columns */
export type Bops_Applications_Var_Pop_Fields = {
  __typename?: 'bops_applications_var_pop_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate var_samp on columns */
export type Bops_Applications_Var_Samp_Fields = {
  __typename?: 'bops_applications_var_samp_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate variance on columns */
export type Bops_Applications_Variance_Fields = {
  __typename?: 'bops_applications_variance_fields';
  id?: Maybe<Scalars['Float']>;
};

/** Empty table schema reference by pg function `get_flow_schema` used to create CSV download in Editor debug console */
export type Flow_Schemas = {
  __typename?: 'flow_schemas';
  flow_id: Scalars['uuid'];
  node: Scalars['String'];
  planx_variable: Scalars['String'];
  text: Scalars['String'];
  type: Scalars['Int'];
};

/** aggregated selection of "flow_schemas" */
export type Flow_Schemas_Aggregate = {
  __typename?: 'flow_schemas_aggregate';
  aggregate?: Maybe<Flow_Schemas_Aggregate_Fields>;
  nodes: Array<Flow_Schemas>;
};

/** aggregate fields of "flow_schemas" */
export type Flow_Schemas_Aggregate_Fields = {
  __typename?: 'flow_schemas_aggregate_fields';
  avg?: Maybe<Flow_Schemas_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<Flow_Schemas_Max_Fields>;
  min?: Maybe<Flow_Schemas_Min_Fields>;
  stddev?: Maybe<Flow_Schemas_Stddev_Fields>;
  stddev_pop?: Maybe<Flow_Schemas_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Flow_Schemas_Stddev_Samp_Fields>;
  sum?: Maybe<Flow_Schemas_Sum_Fields>;
  var_pop?: Maybe<Flow_Schemas_Var_Pop_Fields>;
  var_samp?: Maybe<Flow_Schemas_Var_Samp_Fields>;
  variance?: Maybe<Flow_Schemas_Variance_Fields>;
};


/** aggregate fields of "flow_schemas" */
export type Flow_Schemas_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Flow_Schemas_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** aggregate avg on columns */
export type Flow_Schemas_Avg_Fields = {
  __typename?: 'flow_schemas_avg_fields';
  type?: Maybe<Scalars['Float']>;
};

/** Boolean expression to filter rows from the table "flow_schemas". All fields are combined with a logical 'AND'. */
export type Flow_Schemas_Bool_Exp = {
  _and?: InputMaybe<Array<Flow_Schemas_Bool_Exp>>;
  _not?: InputMaybe<Flow_Schemas_Bool_Exp>;
  _or?: InputMaybe<Array<Flow_Schemas_Bool_Exp>>;
  flow_id?: InputMaybe<Uuid_Comparison_Exp>;
  node?: InputMaybe<String_Comparison_Exp>;
  planx_variable?: InputMaybe<String_Comparison_Exp>;
  text?: InputMaybe<String_Comparison_Exp>;
  type?: InputMaybe<Int_Comparison_Exp>;
};

/** unique or primary key constraints on table "flow_schemas" */
export enum Flow_Schemas_Constraint {
  /** unique or primary key constraint on columns "node", "flow_id" */
  FlowSchemasPkey = 'flow_schemas_pkey'
}

/** input type for incrementing numeric columns in table "flow_schemas" */
export type Flow_Schemas_Inc_Input = {
  type?: InputMaybe<Scalars['Int']>;
};

/** input type for inserting data into table "flow_schemas" */
export type Flow_Schemas_Insert_Input = {
  flow_id?: InputMaybe<Scalars['uuid']>;
  node?: InputMaybe<Scalars['String']>;
  planx_variable?: InputMaybe<Scalars['String']>;
  text?: InputMaybe<Scalars['String']>;
  type?: InputMaybe<Scalars['Int']>;
};

/** aggregate max on columns */
export type Flow_Schemas_Max_Fields = {
  __typename?: 'flow_schemas_max_fields';
  flow_id?: Maybe<Scalars['uuid']>;
  node?: Maybe<Scalars['String']>;
  planx_variable?: Maybe<Scalars['String']>;
  text?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['Int']>;
};

/** aggregate min on columns */
export type Flow_Schemas_Min_Fields = {
  __typename?: 'flow_schemas_min_fields';
  flow_id?: Maybe<Scalars['uuid']>;
  node?: Maybe<Scalars['String']>;
  planx_variable?: Maybe<Scalars['String']>;
  text?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['Int']>;
};

/** response of any mutation on the table "flow_schemas" */
export type Flow_Schemas_Mutation_Response = {
  __typename?: 'flow_schemas_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Flow_Schemas>;
};

/** on_conflict condition type for table "flow_schemas" */
export type Flow_Schemas_On_Conflict = {
  constraint: Flow_Schemas_Constraint;
  update_columns?: Array<Flow_Schemas_Update_Column>;
  where?: InputMaybe<Flow_Schemas_Bool_Exp>;
};

/** Ordering options when selecting data from "flow_schemas". */
export type Flow_Schemas_Order_By = {
  flow_id?: InputMaybe<Order_By>;
  node?: InputMaybe<Order_By>;
  planx_variable?: InputMaybe<Order_By>;
  text?: InputMaybe<Order_By>;
  type?: InputMaybe<Order_By>;
};

/** primary key columns input for table: flow_schemas */
export type Flow_Schemas_Pk_Columns_Input = {
  flow_id: Scalars['uuid'];
  node: Scalars['String'];
};

/** select columns of table "flow_schemas" */
export enum Flow_Schemas_Select_Column {
  /** column name */
  FlowId = 'flow_id',
  /** column name */
  Node = 'node',
  /** column name */
  PlanxVariable = 'planx_variable',
  /** column name */
  Text = 'text',
  /** column name */
  Type = 'type'
}

/** input type for updating data in table "flow_schemas" */
export type Flow_Schemas_Set_Input = {
  flow_id?: InputMaybe<Scalars['uuid']>;
  node?: InputMaybe<Scalars['String']>;
  planx_variable?: InputMaybe<Scalars['String']>;
  text?: InputMaybe<Scalars['String']>;
  type?: InputMaybe<Scalars['Int']>;
};

/** aggregate stddev on columns */
export type Flow_Schemas_Stddev_Fields = {
  __typename?: 'flow_schemas_stddev_fields';
  type?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_pop on columns */
export type Flow_Schemas_Stddev_Pop_Fields = {
  __typename?: 'flow_schemas_stddev_pop_fields';
  type?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_samp on columns */
export type Flow_Schemas_Stddev_Samp_Fields = {
  __typename?: 'flow_schemas_stddev_samp_fields';
  type?: Maybe<Scalars['Float']>;
};

/** aggregate sum on columns */
export type Flow_Schemas_Sum_Fields = {
  __typename?: 'flow_schemas_sum_fields';
  type?: Maybe<Scalars['Int']>;
};

/** update columns of table "flow_schemas" */
export enum Flow_Schemas_Update_Column {
  /** column name */
  FlowId = 'flow_id',
  /** column name */
  Node = 'node',
  /** column name */
  PlanxVariable = 'planx_variable',
  /** column name */
  Text = 'text',
  /** column name */
  Type = 'type'
}

/** aggregate var_pop on columns */
export type Flow_Schemas_Var_Pop_Fields = {
  __typename?: 'flow_schemas_var_pop_fields';
  type?: Maybe<Scalars['Float']>;
};

/** aggregate var_samp on columns */
export type Flow_Schemas_Var_Samp_Fields = {
  __typename?: 'flow_schemas_var_samp_fields';
  type?: Maybe<Scalars['Float']>;
};

/** aggregate variance on columns */
export type Flow_Schemas_Variance_Fields = {
  __typename?: 'flow_schemas_variance_fields';
  type?: Maybe<Scalars['Float']>;
};

/** Flows represent the core services, and changes to the flow content are tracked in `operations` */
export type Flows = {
  __typename?: 'flows';
  created_at: Scalars['timestamptz'];
  /** An object relationship */
  creator?: Maybe<Users>;
  creator_id?: Maybe<Scalars['Int']>;
  /** Structured as a Directed Acyclic Graph (DAGs) and stored "unflattened", meaning that the graph includes "_root" nodes only and not individual nodes from external portals */
  data?: Maybe<Scalars['jsonb']>;
  /** Flow data with portals merged in */
  data_merged?: Maybe<Scalars['jsonb']>;
  id: Scalars['uuid'];
  /** An array relationship */
  operations: Array<Operations>;
  /** An aggregate relationship */
  operations_aggregate: Operations_Aggregate;
  /** An array relationship */
  published_flows: Array<Published_Flows>;
  /** An aggregate relationship */
  published_flows_aggregate: Published_Flows_Aggregate;
  /** An array relationship */
  session_backups: Array<Session_Backups>;
  /** An aggregate relationship */
  session_backups_aggregate: Session_Backups_Aggregate;
  settings?: Maybe<Scalars['jsonb']>;
  slug: Scalars['String'];
  /** An object relationship */
  team?: Maybe<Teams>;
  team_id?: Maybe<Scalars['Int']>;
  updated_at: Scalars['timestamptz'];
  /** Increments when `operations` are made on this flow */
  version?: Maybe<Scalars['Int']>;
};


/** Flows represent the core services, and changes to the flow content are tracked in `operations` */
export type FlowsDataArgs = {
  path?: InputMaybe<Scalars['String']>;
};


/** Flows represent the core services, and changes to the flow content are tracked in `operations` */
export type FlowsData_MergedArgs = {
  path?: InputMaybe<Scalars['String']>;
};


/** Flows represent the core services, and changes to the flow content are tracked in `operations` */
export type FlowsOperationsArgs = {
  distinct_on?: InputMaybe<Array<Operations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Operations_Order_By>>;
  where?: InputMaybe<Operations_Bool_Exp>;
};


/** Flows represent the core services, and changes to the flow content are tracked in `operations` */
export type FlowsOperations_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Operations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Operations_Order_By>>;
  where?: InputMaybe<Operations_Bool_Exp>;
};


/** Flows represent the core services, and changes to the flow content are tracked in `operations` */
export type FlowsPublished_FlowsArgs = {
  distinct_on?: InputMaybe<Array<Published_Flows_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Published_Flows_Order_By>>;
  where?: InputMaybe<Published_Flows_Bool_Exp>;
};


/** Flows represent the core services, and changes to the flow content are tracked in `operations` */
export type FlowsPublished_Flows_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Published_Flows_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Published_Flows_Order_By>>;
  where?: InputMaybe<Published_Flows_Bool_Exp>;
};


/** Flows represent the core services, and changes to the flow content are tracked in `operations` */
export type FlowsSession_BackupsArgs = {
  distinct_on?: InputMaybe<Array<Session_Backups_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Session_Backups_Order_By>>;
  where?: InputMaybe<Session_Backups_Bool_Exp>;
};


/** Flows represent the core services, and changes to the flow content are tracked in `operations` */
export type FlowsSession_Backups_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Session_Backups_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Session_Backups_Order_By>>;
  where?: InputMaybe<Session_Backups_Bool_Exp>;
};


/** Flows represent the core services, and changes to the flow content are tracked in `operations` */
export type FlowsSettingsArgs = {
  path?: InputMaybe<Scalars['String']>;
};

/** aggregated selection of "flows" */
export type Flows_Aggregate = {
  __typename?: 'flows_aggregate';
  aggregate?: Maybe<Flows_Aggregate_Fields>;
  nodes: Array<Flows>;
};

/** aggregate fields of "flows" */
export type Flows_Aggregate_Fields = {
  __typename?: 'flows_aggregate_fields';
  avg?: Maybe<Flows_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<Flows_Max_Fields>;
  min?: Maybe<Flows_Min_Fields>;
  stddev?: Maybe<Flows_Stddev_Fields>;
  stddev_pop?: Maybe<Flows_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Flows_Stddev_Samp_Fields>;
  sum?: Maybe<Flows_Sum_Fields>;
  var_pop?: Maybe<Flows_Var_Pop_Fields>;
  var_samp?: Maybe<Flows_Var_Samp_Fields>;
  variance?: Maybe<Flows_Variance_Fields>;
};


/** aggregate fields of "flows" */
export type Flows_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Flows_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "flows" */
export type Flows_Aggregate_Order_By = {
  avg?: InputMaybe<Flows_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Flows_Max_Order_By>;
  min?: InputMaybe<Flows_Min_Order_By>;
  stddev?: InputMaybe<Flows_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Flows_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Flows_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Flows_Sum_Order_By>;
  var_pop?: InputMaybe<Flows_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Flows_Var_Samp_Order_By>;
  variance?: InputMaybe<Flows_Variance_Order_By>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Flows_Append_Input = {
  /** Structured as a Directed Acyclic Graph (DAGs) and stored "unflattened", meaning that the graph includes "_root" nodes only and not individual nodes from external portals */
  data?: InputMaybe<Scalars['jsonb']>;
  settings?: InputMaybe<Scalars['jsonb']>;
};

/** input type for inserting array relation for remote table "flows" */
export type Flows_Arr_Rel_Insert_Input = {
  data: Array<Flows_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Flows_On_Conflict>;
};

/** aggregate avg on columns */
export type Flows_Avg_Fields = {
  __typename?: 'flows_avg_fields';
  creator_id?: Maybe<Scalars['Float']>;
  team_id?: Maybe<Scalars['Float']>;
  /** Increments when `operations` are made on this flow */
  version?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "flows" */
export type Flows_Avg_Order_By = {
  creator_id?: InputMaybe<Order_By>;
  team_id?: InputMaybe<Order_By>;
  /** Increments when `operations` are made on this flow */
  version?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "flows". All fields are combined with a logical 'AND'. */
export type Flows_Bool_Exp = {
  _and?: InputMaybe<Array<Flows_Bool_Exp>>;
  _not?: InputMaybe<Flows_Bool_Exp>;
  _or?: InputMaybe<Array<Flows_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  creator?: InputMaybe<Users_Bool_Exp>;
  creator_id?: InputMaybe<Int_Comparison_Exp>;
  data?: InputMaybe<Jsonb_Comparison_Exp>;
  data_merged?: InputMaybe<Jsonb_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  operations?: InputMaybe<Operations_Bool_Exp>;
  published_flows?: InputMaybe<Published_Flows_Bool_Exp>;
  session_backups?: InputMaybe<Session_Backups_Bool_Exp>;
  settings?: InputMaybe<Jsonb_Comparison_Exp>;
  slug?: InputMaybe<String_Comparison_Exp>;
  team?: InputMaybe<Teams_Bool_Exp>;
  team_id?: InputMaybe<Int_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  version?: InputMaybe<Int_Comparison_Exp>;
};

/** unique or primary key constraints on table "flows" */
export enum Flows_Constraint {
  /** unique or primary key constraint on columns "id" */
  FlowsPkey = 'flows_pkey',
  /** unique or primary key constraint on columns "team_id", "slug" */
  FlowsTeamIdSlugKey = 'flows_team_id_slug_key'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Flows_Delete_At_Path_Input = {
  /** Structured as a Directed Acyclic Graph (DAGs) and stored "unflattened", meaning that the graph includes "_root" nodes only and not individual nodes from external portals */
  data?: InputMaybe<Array<Scalars['String']>>;
  settings?: InputMaybe<Array<Scalars['String']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Flows_Delete_Elem_Input = {
  /** Structured as a Directed Acyclic Graph (DAGs) and stored "unflattened", meaning that the graph includes "_root" nodes only and not individual nodes from external portals */
  data?: InputMaybe<Scalars['Int']>;
  settings?: InputMaybe<Scalars['Int']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Flows_Delete_Key_Input = {
  /** Structured as a Directed Acyclic Graph (DAGs) and stored "unflattened", meaning that the graph includes "_root" nodes only and not individual nodes from external portals */
  data?: InputMaybe<Scalars['String']>;
  settings?: InputMaybe<Scalars['String']>;
};

/** input type for incrementing numeric columns in table "flows" */
export type Flows_Inc_Input = {
  creator_id?: InputMaybe<Scalars['Int']>;
  team_id?: InputMaybe<Scalars['Int']>;
  /** Increments when `operations` are made on this flow */
  version?: InputMaybe<Scalars['Int']>;
};

/** input type for inserting data into table "flows" */
export type Flows_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']>;
  creator?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  creator_id?: InputMaybe<Scalars['Int']>;
  /** Structured as a Directed Acyclic Graph (DAGs) and stored "unflattened", meaning that the graph includes "_root" nodes only and not individual nodes from external portals */
  data?: InputMaybe<Scalars['jsonb']>;
  id?: InputMaybe<Scalars['uuid']>;
  operations?: InputMaybe<Operations_Arr_Rel_Insert_Input>;
  published_flows?: InputMaybe<Published_Flows_Arr_Rel_Insert_Input>;
  session_backups?: InputMaybe<Session_Backups_Arr_Rel_Insert_Input>;
  settings?: InputMaybe<Scalars['jsonb']>;
  slug?: InputMaybe<Scalars['String']>;
  team?: InputMaybe<Teams_Obj_Rel_Insert_Input>;
  team_id?: InputMaybe<Scalars['Int']>;
  updated_at?: InputMaybe<Scalars['timestamptz']>;
  /** Increments when `operations` are made on this flow */
  version?: InputMaybe<Scalars['Int']>;
};

/** aggregate max on columns */
export type Flows_Max_Fields = {
  __typename?: 'flows_max_fields';
  created_at?: Maybe<Scalars['timestamptz']>;
  creator_id?: Maybe<Scalars['Int']>;
  id?: Maybe<Scalars['uuid']>;
  slug?: Maybe<Scalars['String']>;
  team_id?: Maybe<Scalars['Int']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
  /** Increments when `operations` are made on this flow */
  version?: Maybe<Scalars['Int']>;
};

/** order by max() on columns of table "flows" */
export type Flows_Max_Order_By = {
  created_at?: InputMaybe<Order_By>;
  creator_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  slug?: InputMaybe<Order_By>;
  team_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  /** Increments when `operations` are made on this flow */
  version?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Flows_Min_Fields = {
  __typename?: 'flows_min_fields';
  created_at?: Maybe<Scalars['timestamptz']>;
  creator_id?: Maybe<Scalars['Int']>;
  id?: Maybe<Scalars['uuid']>;
  slug?: Maybe<Scalars['String']>;
  team_id?: Maybe<Scalars['Int']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
  /** Increments when `operations` are made on this flow */
  version?: Maybe<Scalars['Int']>;
};

/** order by min() on columns of table "flows" */
export type Flows_Min_Order_By = {
  created_at?: InputMaybe<Order_By>;
  creator_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  slug?: InputMaybe<Order_By>;
  team_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  /** Increments when `operations` are made on this flow */
  version?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "flows" */
export type Flows_Mutation_Response = {
  __typename?: 'flows_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Flows>;
};

/** input type for inserting object relation for remote table "flows" */
export type Flows_Obj_Rel_Insert_Input = {
  data: Flows_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Flows_On_Conflict>;
};

/** on_conflict condition type for table "flows" */
export type Flows_On_Conflict = {
  constraint: Flows_Constraint;
  update_columns?: Array<Flows_Update_Column>;
  where?: InputMaybe<Flows_Bool_Exp>;
};

/** Ordering options when selecting data from "flows". */
export type Flows_Order_By = {
  created_at?: InputMaybe<Order_By>;
  creator?: InputMaybe<Users_Order_By>;
  creator_id?: InputMaybe<Order_By>;
  data?: InputMaybe<Order_By>;
  data_merged?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  operations_aggregate?: InputMaybe<Operations_Aggregate_Order_By>;
  published_flows_aggregate?: InputMaybe<Published_Flows_Aggregate_Order_By>;
  session_backups_aggregate?: InputMaybe<Session_Backups_Aggregate_Order_By>;
  settings?: InputMaybe<Order_By>;
  slug?: InputMaybe<Order_By>;
  team?: InputMaybe<Teams_Order_By>;
  team_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  version?: InputMaybe<Order_By>;
};

/** primary key columns input for table: flows */
export type Flows_Pk_Columns_Input = {
  id: Scalars['uuid'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Flows_Prepend_Input = {
  /** Structured as a Directed Acyclic Graph (DAGs) and stored "unflattened", meaning that the graph includes "_root" nodes only and not individual nodes from external portals */
  data?: InputMaybe<Scalars['jsonb']>;
  settings?: InputMaybe<Scalars['jsonb']>;
};

/** select columns of table "flows" */
export enum Flows_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CreatorId = 'creator_id',
  /** column name */
  Data = 'data',
  /** column name */
  Id = 'id',
  /** column name */
  Settings = 'settings',
  /** column name */
  Slug = 'slug',
  /** column name */
  TeamId = 'team_id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  Version = 'version'
}

/** input type for updating data in table "flows" */
export type Flows_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']>;
  creator_id?: InputMaybe<Scalars['Int']>;
  /** Structured as a Directed Acyclic Graph (DAGs) and stored "unflattened", meaning that the graph includes "_root" nodes only and not individual nodes from external portals */
  data?: InputMaybe<Scalars['jsonb']>;
  id?: InputMaybe<Scalars['uuid']>;
  settings?: InputMaybe<Scalars['jsonb']>;
  slug?: InputMaybe<Scalars['String']>;
  team_id?: InputMaybe<Scalars['Int']>;
  updated_at?: InputMaybe<Scalars['timestamptz']>;
  /** Increments when `operations` are made on this flow */
  version?: InputMaybe<Scalars['Int']>;
};

/** aggregate stddev on columns */
export type Flows_Stddev_Fields = {
  __typename?: 'flows_stddev_fields';
  creator_id?: Maybe<Scalars['Float']>;
  team_id?: Maybe<Scalars['Float']>;
  /** Increments when `operations` are made on this flow */
  version?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "flows" */
export type Flows_Stddev_Order_By = {
  creator_id?: InputMaybe<Order_By>;
  team_id?: InputMaybe<Order_By>;
  /** Increments when `operations` are made on this flow */
  version?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Flows_Stddev_Pop_Fields = {
  __typename?: 'flows_stddev_pop_fields';
  creator_id?: Maybe<Scalars['Float']>;
  team_id?: Maybe<Scalars['Float']>;
  /** Increments when `operations` are made on this flow */
  version?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "flows" */
export type Flows_Stddev_Pop_Order_By = {
  creator_id?: InputMaybe<Order_By>;
  team_id?: InputMaybe<Order_By>;
  /** Increments when `operations` are made on this flow */
  version?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Flows_Stddev_Samp_Fields = {
  __typename?: 'flows_stddev_samp_fields';
  creator_id?: Maybe<Scalars['Float']>;
  team_id?: Maybe<Scalars['Float']>;
  /** Increments when `operations` are made on this flow */
  version?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "flows" */
export type Flows_Stddev_Samp_Order_By = {
  creator_id?: InputMaybe<Order_By>;
  team_id?: InputMaybe<Order_By>;
  /** Increments when `operations` are made on this flow */
  version?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type Flows_Sum_Fields = {
  __typename?: 'flows_sum_fields';
  creator_id?: Maybe<Scalars['Int']>;
  team_id?: Maybe<Scalars['Int']>;
  /** Increments when `operations` are made on this flow */
  version?: Maybe<Scalars['Int']>;
};

/** order by sum() on columns of table "flows" */
export type Flows_Sum_Order_By = {
  creator_id?: InputMaybe<Order_By>;
  team_id?: InputMaybe<Order_By>;
  /** Increments when `operations` are made on this flow */
  version?: InputMaybe<Order_By>;
};

/** update columns of table "flows" */
export enum Flows_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CreatorId = 'creator_id',
  /** column name */
  Data = 'data',
  /** column name */
  Id = 'id',
  /** column name */
  Settings = 'settings',
  /** column name */
  Slug = 'slug',
  /** column name */
  TeamId = 'team_id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  Version = 'version'
}

/** aggregate var_pop on columns */
export type Flows_Var_Pop_Fields = {
  __typename?: 'flows_var_pop_fields';
  creator_id?: Maybe<Scalars['Float']>;
  team_id?: Maybe<Scalars['Float']>;
  /** Increments when `operations` are made on this flow */
  version?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "flows" */
export type Flows_Var_Pop_Order_By = {
  creator_id?: InputMaybe<Order_By>;
  team_id?: InputMaybe<Order_By>;
  /** Increments when `operations` are made on this flow */
  version?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Flows_Var_Samp_Fields = {
  __typename?: 'flows_var_samp_fields';
  creator_id?: Maybe<Scalars['Float']>;
  team_id?: Maybe<Scalars['Float']>;
  /** Increments when `operations` are made on this flow */
  version?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "flows" */
export type Flows_Var_Samp_Order_By = {
  creator_id?: InputMaybe<Order_By>;
  team_id?: InputMaybe<Order_By>;
  /** Increments when `operations` are made on this flow */
  version?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Flows_Variance_Fields = {
  __typename?: 'flows_variance_fields';
  creator_id?: Maybe<Scalars['Float']>;
  team_id?: Maybe<Scalars['Float']>;
  /** Increments when `operations` are made on this flow */
  version?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "flows" */
export type Flows_Variance_Order_By = {
  creator_id?: InputMaybe<Order_By>;
  team_id?: InputMaybe<Order_By>;
  /** Increments when `operations` are made on this flow */
  version?: InputMaybe<Order_By>;
};

export type Get_Flow_Schema_Args = {
  published_flow_id?: InputMaybe<Scalars['String']>;
};

/** Records default service configurations like footer content, can be overridden by custom `team` settings */
export type Global_Settings = {
  __typename?: 'global_settings';
  footer_content: Scalars['jsonb'];
  id: Scalars['Int'];
};


/** Records default service configurations like footer content, can be overridden by custom `team` settings */
export type Global_SettingsFooter_ContentArgs = {
  path?: InputMaybe<Scalars['String']>;
};

/** aggregated selection of "global_settings" */
export type Global_Settings_Aggregate = {
  __typename?: 'global_settings_aggregate';
  aggregate?: Maybe<Global_Settings_Aggregate_Fields>;
  nodes: Array<Global_Settings>;
};

/** aggregate fields of "global_settings" */
export type Global_Settings_Aggregate_Fields = {
  __typename?: 'global_settings_aggregate_fields';
  avg?: Maybe<Global_Settings_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<Global_Settings_Max_Fields>;
  min?: Maybe<Global_Settings_Min_Fields>;
  stddev?: Maybe<Global_Settings_Stddev_Fields>;
  stddev_pop?: Maybe<Global_Settings_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Global_Settings_Stddev_Samp_Fields>;
  sum?: Maybe<Global_Settings_Sum_Fields>;
  var_pop?: Maybe<Global_Settings_Var_Pop_Fields>;
  var_samp?: Maybe<Global_Settings_Var_Samp_Fields>;
  variance?: Maybe<Global_Settings_Variance_Fields>;
};


/** aggregate fields of "global_settings" */
export type Global_Settings_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Global_Settings_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Global_Settings_Append_Input = {
  footer_content?: InputMaybe<Scalars['jsonb']>;
};

/** aggregate avg on columns */
export type Global_Settings_Avg_Fields = {
  __typename?: 'global_settings_avg_fields';
  id?: Maybe<Scalars['Float']>;
};

/** Boolean expression to filter rows from the table "global_settings". All fields are combined with a logical 'AND'. */
export type Global_Settings_Bool_Exp = {
  _and?: InputMaybe<Array<Global_Settings_Bool_Exp>>;
  _not?: InputMaybe<Global_Settings_Bool_Exp>;
  _or?: InputMaybe<Array<Global_Settings_Bool_Exp>>;
  footer_content?: InputMaybe<Jsonb_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
};

/** unique or primary key constraints on table "global_settings" */
export enum Global_Settings_Constraint {
  /** unique or primary key constraint on columns "id" */
  GlobalSettingsPkey = 'global_settings_pkey'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Global_Settings_Delete_At_Path_Input = {
  footer_content?: InputMaybe<Array<Scalars['String']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Global_Settings_Delete_Elem_Input = {
  footer_content?: InputMaybe<Scalars['Int']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Global_Settings_Delete_Key_Input = {
  footer_content?: InputMaybe<Scalars['String']>;
};

/** input type for incrementing numeric columns in table "global_settings" */
export type Global_Settings_Inc_Input = {
  id?: InputMaybe<Scalars['Int']>;
};

/** input type for inserting data into table "global_settings" */
export type Global_Settings_Insert_Input = {
  footer_content?: InputMaybe<Scalars['jsonb']>;
  id?: InputMaybe<Scalars['Int']>;
};

/** aggregate max on columns */
export type Global_Settings_Max_Fields = {
  __typename?: 'global_settings_max_fields';
  id?: Maybe<Scalars['Int']>;
};

/** aggregate min on columns */
export type Global_Settings_Min_Fields = {
  __typename?: 'global_settings_min_fields';
  id?: Maybe<Scalars['Int']>;
};

/** response of any mutation on the table "global_settings" */
export type Global_Settings_Mutation_Response = {
  __typename?: 'global_settings_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Global_Settings>;
};

/** on_conflict condition type for table "global_settings" */
export type Global_Settings_On_Conflict = {
  constraint: Global_Settings_Constraint;
  update_columns?: Array<Global_Settings_Update_Column>;
  where?: InputMaybe<Global_Settings_Bool_Exp>;
};

/** Ordering options when selecting data from "global_settings". */
export type Global_Settings_Order_By = {
  footer_content?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: global_settings */
export type Global_Settings_Pk_Columns_Input = {
  id: Scalars['Int'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Global_Settings_Prepend_Input = {
  footer_content?: InputMaybe<Scalars['jsonb']>;
};

/** select columns of table "global_settings" */
export enum Global_Settings_Select_Column {
  /** column name */
  FooterContent = 'footer_content',
  /** column name */
  Id = 'id'
}

/** input type for updating data in table "global_settings" */
export type Global_Settings_Set_Input = {
  footer_content?: InputMaybe<Scalars['jsonb']>;
  id?: InputMaybe<Scalars['Int']>;
};

/** aggregate stddev on columns */
export type Global_Settings_Stddev_Fields = {
  __typename?: 'global_settings_stddev_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_pop on columns */
export type Global_Settings_Stddev_Pop_Fields = {
  __typename?: 'global_settings_stddev_pop_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_samp on columns */
export type Global_Settings_Stddev_Samp_Fields = {
  __typename?: 'global_settings_stddev_samp_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate sum on columns */
export type Global_Settings_Sum_Fields = {
  __typename?: 'global_settings_sum_fields';
  id?: Maybe<Scalars['Int']>;
};

/** update columns of table "global_settings" */
export enum Global_Settings_Update_Column {
  /** column name */
  FooterContent = 'footer_content',
  /** column name */
  Id = 'id'
}

/** aggregate var_pop on columns */
export type Global_Settings_Var_Pop_Fields = {
  __typename?: 'global_settings_var_pop_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate var_samp on columns */
export type Global_Settings_Var_Samp_Fields = {
  __typename?: 'global_settings_var_samp_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate variance on columns */
export type Global_Settings_Variance_Fields = {
  __typename?: 'global_settings_variance_fields';
  id?: Maybe<Scalars['Float']>;
};

export type Jsonb_Cast_Exp = {
  String?: InputMaybe<String_Comparison_Exp>;
};

/** Boolean expression to compare columns of type "jsonb". All fields are combined with logical 'AND'. */
export type Jsonb_Comparison_Exp = {
  _cast?: InputMaybe<Jsonb_Cast_Exp>;
  /** is the column contained in the given json value */
  _contained_in?: InputMaybe<Scalars['jsonb']>;
  /** does the column contain the given json value at the top level */
  _contains?: InputMaybe<Scalars['jsonb']>;
  _eq?: InputMaybe<Scalars['jsonb']>;
  _gt?: InputMaybe<Scalars['jsonb']>;
  _gte?: InputMaybe<Scalars['jsonb']>;
  /** does the string exist as a top-level key in the column */
  _has_key?: InputMaybe<Scalars['String']>;
  /** do all of these strings exist as top-level keys in the column */
  _has_keys_all?: InputMaybe<Array<Scalars['String']>>;
  /** do any of these strings exist as top-level keys in the column */
  _has_keys_any?: InputMaybe<Array<Scalars['String']>>;
  _in?: InputMaybe<Array<Scalars['jsonb']>>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  _lt?: InputMaybe<Scalars['jsonb']>;
  _lte?: InputMaybe<Scalars['jsonb']>;
  _neq?: InputMaybe<Scalars['jsonb']>;
  _nin?: InputMaybe<Array<Scalars['jsonb']>>;
};

/** Introduced when we migrated from local storage to Save & Return to store a representation of a user's local session data in order to support simultaneous applications */
export type Lowcal_Sessions = {
  __typename?: 'lowcal_sessions';
  created_at?: Maybe<Scalars['timestamptz']>;
  data: Scalars['jsonb'];
  deleted_at?: Maybe<Scalars['timestamptz']>;
  email: Scalars['String'];
  /** An object relationship */
  flow?: Maybe<Flows>;
  flow_id?: Maybe<Scalars['uuid']>;
  /** Tracks if email reminder and expiry events have been setup for session */
  has_user_saved: Scalars['Boolean'];
  id: Scalars['uuid'];
  submitted_at?: Maybe<Scalars['timestamptz']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
};


/** Introduced when we migrated from local storage to Save & Return to store a representation of a user's local session data in order to support simultaneous applications */
export type Lowcal_SessionsDataArgs = {
  path?: InputMaybe<Scalars['String']>;
};

/** aggregated selection of "lowcal_sessions" */
export type Lowcal_Sessions_Aggregate = {
  __typename?: 'lowcal_sessions_aggregate';
  aggregate?: Maybe<Lowcal_Sessions_Aggregate_Fields>;
  nodes: Array<Lowcal_Sessions>;
};

/** aggregate fields of "lowcal_sessions" */
export type Lowcal_Sessions_Aggregate_Fields = {
  __typename?: 'lowcal_sessions_aggregate_fields';
  count: Scalars['Int'];
  max?: Maybe<Lowcal_Sessions_Max_Fields>;
  min?: Maybe<Lowcal_Sessions_Min_Fields>;
};


/** aggregate fields of "lowcal_sessions" */
export type Lowcal_Sessions_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Lowcal_Sessions_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Lowcal_Sessions_Append_Input = {
  data?: InputMaybe<Scalars['jsonb']>;
};

/** Boolean expression to filter rows from the table "lowcal_sessions". All fields are combined with a logical 'AND'. */
export type Lowcal_Sessions_Bool_Exp = {
  _and?: InputMaybe<Array<Lowcal_Sessions_Bool_Exp>>;
  _not?: InputMaybe<Lowcal_Sessions_Bool_Exp>;
  _or?: InputMaybe<Array<Lowcal_Sessions_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  data?: InputMaybe<Jsonb_Comparison_Exp>;
  deleted_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  email?: InputMaybe<String_Comparison_Exp>;
  flow?: InputMaybe<Flows_Bool_Exp>;
  flow_id?: InputMaybe<Uuid_Comparison_Exp>;
  has_user_saved?: InputMaybe<Boolean_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  submitted_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "lowcal_sessions" */
export enum Lowcal_Sessions_Constraint {
  /** unique or primary key constraint on columns "id" */
  LowcalSessionsPkey = 'lowcal_sessions_pkey'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Lowcal_Sessions_Delete_At_Path_Input = {
  data?: InputMaybe<Array<Scalars['String']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Lowcal_Sessions_Delete_Elem_Input = {
  data?: InputMaybe<Scalars['Int']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Lowcal_Sessions_Delete_Key_Input = {
  data?: InputMaybe<Scalars['String']>;
};

/** input type for inserting data into table "lowcal_sessions" */
export type Lowcal_Sessions_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']>;
  data?: InputMaybe<Scalars['jsonb']>;
  deleted_at?: InputMaybe<Scalars['timestamptz']>;
  email?: InputMaybe<Scalars['String']>;
  flow?: InputMaybe<Flows_Obj_Rel_Insert_Input>;
  flow_id?: InputMaybe<Scalars['uuid']>;
  /** Tracks if email reminder and expiry events have been setup for session */
  has_user_saved?: InputMaybe<Scalars['Boolean']>;
  id?: InputMaybe<Scalars['uuid']>;
  submitted_at?: InputMaybe<Scalars['timestamptz']>;
  updated_at?: InputMaybe<Scalars['timestamptz']>;
};

/** aggregate max on columns */
export type Lowcal_Sessions_Max_Fields = {
  __typename?: 'lowcal_sessions_max_fields';
  created_at?: Maybe<Scalars['timestamptz']>;
  deleted_at?: Maybe<Scalars['timestamptz']>;
  email?: Maybe<Scalars['String']>;
  flow_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
  submitted_at?: Maybe<Scalars['timestamptz']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
};

/** aggregate min on columns */
export type Lowcal_Sessions_Min_Fields = {
  __typename?: 'lowcal_sessions_min_fields';
  created_at?: Maybe<Scalars['timestamptz']>;
  deleted_at?: Maybe<Scalars['timestamptz']>;
  email?: Maybe<Scalars['String']>;
  flow_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
  submitted_at?: Maybe<Scalars['timestamptz']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
};

/** response of any mutation on the table "lowcal_sessions" */
export type Lowcal_Sessions_Mutation_Response = {
  __typename?: 'lowcal_sessions_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Lowcal_Sessions>;
};

/** on_conflict condition type for table "lowcal_sessions" */
export type Lowcal_Sessions_On_Conflict = {
  constraint: Lowcal_Sessions_Constraint;
  update_columns?: Array<Lowcal_Sessions_Update_Column>;
  where?: InputMaybe<Lowcal_Sessions_Bool_Exp>;
};

/** Ordering options when selecting data from "lowcal_sessions". */
export type Lowcal_Sessions_Order_By = {
  created_at?: InputMaybe<Order_By>;
  data?: InputMaybe<Order_By>;
  deleted_at?: InputMaybe<Order_By>;
  email?: InputMaybe<Order_By>;
  flow?: InputMaybe<Flows_Order_By>;
  flow_id?: InputMaybe<Order_By>;
  has_user_saved?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  submitted_at?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: lowcal_sessions */
export type Lowcal_Sessions_Pk_Columns_Input = {
  id: Scalars['uuid'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Lowcal_Sessions_Prepend_Input = {
  data?: InputMaybe<Scalars['jsonb']>;
};

/** select columns of table "lowcal_sessions" */
export enum Lowcal_Sessions_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Data = 'data',
  /** column name */
  DeletedAt = 'deleted_at',
  /** column name */
  Email = 'email',
  /** column name */
  FlowId = 'flow_id',
  /** column name */
  HasUserSaved = 'has_user_saved',
  /** column name */
  Id = 'id',
  /** column name */
  SubmittedAt = 'submitted_at',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** input type for updating data in table "lowcal_sessions" */
export type Lowcal_Sessions_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']>;
  data?: InputMaybe<Scalars['jsonb']>;
  deleted_at?: InputMaybe<Scalars['timestamptz']>;
  email?: InputMaybe<Scalars['String']>;
  flow_id?: InputMaybe<Scalars['uuid']>;
  /** Tracks if email reminder and expiry events have been setup for session */
  has_user_saved?: InputMaybe<Scalars['Boolean']>;
  id?: InputMaybe<Scalars['uuid']>;
  submitted_at?: InputMaybe<Scalars['timestamptz']>;
  updated_at?: InputMaybe<Scalars['timestamptz']>;
};

/** update columns of table "lowcal_sessions" */
export enum Lowcal_Sessions_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Data = 'data',
  /** column name */
  DeletedAt = 'deleted_at',
  /** column name */
  Email = 'email',
  /** column name */
  FlowId = 'flow_id',
  /** column name */
  HasUserSaved = 'has_user_saved',
  /** column name */
  Id = 'id',
  /** column name */
  SubmittedAt = 'submitted_at',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** mutation root */
export type Mutation_Root = {
  __typename?: 'mutation_root';
  /** delete data from the table: "analytics" */
  delete_analytics?: Maybe<Analytics_Mutation_Response>;
  /** delete single row from the table: "analytics" */
  delete_analytics_by_pk?: Maybe<Analytics>;
  /** delete data from the table: "analytics_logs" */
  delete_analytics_logs?: Maybe<Analytics_Logs_Mutation_Response>;
  /** delete single row from the table: "analytics_logs" */
  delete_analytics_logs_by_pk?: Maybe<Analytics_Logs>;
  /** delete data from the table: "blpu_codes" */
  delete_blpu_codes?: Maybe<Blpu_Codes_Mutation_Response>;
  /** delete single row from the table: "blpu_codes" */
  delete_blpu_codes_by_pk?: Maybe<Blpu_Codes>;
  /** delete data from the table: "bops_applications" */
  delete_bops_applications?: Maybe<Bops_Applications_Mutation_Response>;
  /** delete single row from the table: "bops_applications" */
  delete_bops_applications_by_pk?: Maybe<Bops_Applications>;
  /** delete data from the table: "flow_schemas" */
  delete_flow_schemas?: Maybe<Flow_Schemas_Mutation_Response>;
  /** delete single row from the table: "flow_schemas" */
  delete_flow_schemas_by_pk?: Maybe<Flow_Schemas>;
  /** delete data from the table: "flows" */
  delete_flows?: Maybe<Flows_Mutation_Response>;
  /** delete single row from the table: "flows" */
  delete_flows_by_pk?: Maybe<Flows>;
  /** delete data from the table: "global_settings" */
  delete_global_settings?: Maybe<Global_Settings_Mutation_Response>;
  /** delete single row from the table: "global_settings" */
  delete_global_settings_by_pk?: Maybe<Global_Settings>;
  /** delete data from the table: "lowcal_sessions" */
  delete_lowcal_sessions?: Maybe<Lowcal_Sessions_Mutation_Response>;
  /** delete single row from the table: "lowcal_sessions" */
  delete_lowcal_sessions_by_pk?: Maybe<Lowcal_Sessions>;
  /** delete data from the table: "operations" */
  delete_operations?: Maybe<Operations_Mutation_Response>;
  /** delete single row from the table: "operations" */
  delete_operations_by_pk?: Maybe<Operations>;
  /** delete data from the table: "planning_constraints_requests" */
  delete_planning_constraints_requests?: Maybe<Planning_Constraints_Requests_Mutation_Response>;
  /** delete single row from the table: "planning_constraints_requests" */
  delete_planning_constraints_requests_by_pk?: Maybe<Planning_Constraints_Requests>;
  /** delete data from the table: "project_types" */
  delete_project_types?: Maybe<Project_Types_Mutation_Response>;
  /** delete single row from the table: "project_types" */
  delete_project_types_by_pk?: Maybe<Project_Types>;
  /** delete data from the table: "published_flows" */
  delete_published_flows?: Maybe<Published_Flows_Mutation_Response>;
  /** delete single row from the table: "published_flows" */
  delete_published_flows_by_pk?: Maybe<Published_Flows>;
  /** delete data from the table: "reconciliation_requests" */
  delete_reconciliation_requests?: Maybe<Reconciliation_Requests_Mutation_Response>;
  /** delete single row from the table: "reconciliation_requests" */
  delete_reconciliation_requests_by_pk?: Maybe<Reconciliation_Requests>;
  /** delete data from the table: "session_backups" */
  delete_session_backups?: Maybe<Session_Backups_Mutation_Response>;
  /** delete single row from the table: "session_backups" */
  delete_session_backups_by_pk?: Maybe<Session_Backups>;
  /** delete data from the table: "team_members" */
  delete_team_members?: Maybe<Team_Members_Mutation_Response>;
  /** delete single row from the table: "team_members" */
  delete_team_members_by_pk?: Maybe<Team_Members>;
  /** delete data from the table: "teams" */
  delete_teams?: Maybe<Teams_Mutation_Response>;
  /** delete single row from the table: "teams" */
  delete_teams_by_pk?: Maybe<Teams>;
  /** delete data from the table: "uniform_applications" */
  delete_uniform_applications?: Maybe<Uniform_Applications_Mutation_Response>;
  /** delete single row from the table: "uniform_applications" */
  delete_uniform_applications_by_pk?: Maybe<Uniform_Applications>;
  /** delete data from the table: "users" */
  delete_users?: Maybe<Users_Mutation_Response>;
  /** delete single row from the table: "users" */
  delete_users_by_pk?: Maybe<Users>;
  /** insert data into the table: "analytics" */
  insert_analytics?: Maybe<Analytics_Mutation_Response>;
  /** insert data into the table: "analytics_logs" */
  insert_analytics_logs?: Maybe<Analytics_Logs_Mutation_Response>;
  /** insert a single row into the table: "analytics_logs" */
  insert_analytics_logs_one?: Maybe<Analytics_Logs>;
  /** insert a single row into the table: "analytics" */
  insert_analytics_one?: Maybe<Analytics>;
  /** insert data into the table: "blpu_codes" */
  insert_blpu_codes?: Maybe<Blpu_Codes_Mutation_Response>;
  /** insert a single row into the table: "blpu_codes" */
  insert_blpu_codes_one?: Maybe<Blpu_Codes>;
  /** insert data into the table: "bops_applications" */
  insert_bops_applications?: Maybe<Bops_Applications_Mutation_Response>;
  /** insert a single row into the table: "bops_applications" */
  insert_bops_applications_one?: Maybe<Bops_Applications>;
  /** insert data into the table: "flow_schemas" */
  insert_flow_schemas?: Maybe<Flow_Schemas_Mutation_Response>;
  /** insert a single row into the table: "flow_schemas" */
  insert_flow_schemas_one?: Maybe<Flow_Schemas>;
  /** insert data into the table: "flows" */
  insert_flows?: Maybe<Flows_Mutation_Response>;
  /** insert a single row into the table: "flows" */
  insert_flows_one?: Maybe<Flows>;
  /** insert data into the table: "global_settings" */
  insert_global_settings?: Maybe<Global_Settings_Mutation_Response>;
  /** insert a single row into the table: "global_settings" */
  insert_global_settings_one?: Maybe<Global_Settings>;
  /** insert data into the table: "lowcal_sessions" */
  insert_lowcal_sessions?: Maybe<Lowcal_Sessions_Mutation_Response>;
  /** insert a single row into the table: "lowcal_sessions" */
  insert_lowcal_sessions_one?: Maybe<Lowcal_Sessions>;
  /** insert data into the table: "operations" */
  insert_operations?: Maybe<Operations_Mutation_Response>;
  /** insert a single row into the table: "operations" */
  insert_operations_one?: Maybe<Operations>;
  /** insert data into the table: "planning_constraints_requests" */
  insert_planning_constraints_requests?: Maybe<Planning_Constraints_Requests_Mutation_Response>;
  /** insert a single row into the table: "planning_constraints_requests" */
  insert_planning_constraints_requests_one?: Maybe<Planning_Constraints_Requests>;
  /** insert data into the table: "project_types" */
  insert_project_types?: Maybe<Project_Types_Mutation_Response>;
  /** insert a single row into the table: "project_types" */
  insert_project_types_one?: Maybe<Project_Types>;
  /** insert data into the table: "published_flows" */
  insert_published_flows?: Maybe<Published_Flows_Mutation_Response>;
  /** insert a single row into the table: "published_flows" */
  insert_published_flows_one?: Maybe<Published_Flows>;
  /** insert data into the table: "reconciliation_requests" */
  insert_reconciliation_requests?: Maybe<Reconciliation_Requests_Mutation_Response>;
  /** insert a single row into the table: "reconciliation_requests" */
  insert_reconciliation_requests_one?: Maybe<Reconciliation_Requests>;
  /** insert data into the table: "session_backups" */
  insert_session_backups?: Maybe<Session_Backups_Mutation_Response>;
  /** insert a single row into the table: "session_backups" */
  insert_session_backups_one?: Maybe<Session_Backups>;
  /** insert data into the table: "team_members" */
  insert_team_members?: Maybe<Team_Members_Mutation_Response>;
  /** insert a single row into the table: "team_members" */
  insert_team_members_one?: Maybe<Team_Members>;
  /** insert data into the table: "teams" */
  insert_teams?: Maybe<Teams_Mutation_Response>;
  /** insert a single row into the table: "teams" */
  insert_teams_one?: Maybe<Teams>;
  /** insert data into the table: "uniform_applications" */
  insert_uniform_applications?: Maybe<Uniform_Applications_Mutation_Response>;
  /** insert a single row into the table: "uniform_applications" */
  insert_uniform_applications_one?: Maybe<Uniform_Applications>;
  /** insert data into the table: "users" */
  insert_users?: Maybe<Users_Mutation_Response>;
  /** insert a single row into the table: "users" */
  insert_users_one?: Maybe<Users>;
  /** update data of the table: "analytics" */
  update_analytics?: Maybe<Analytics_Mutation_Response>;
  /** update single row of the table: "analytics" */
  update_analytics_by_pk?: Maybe<Analytics>;
  /** update data of the table: "analytics_logs" */
  update_analytics_logs?: Maybe<Analytics_Logs_Mutation_Response>;
  /** update single row of the table: "analytics_logs" */
  update_analytics_logs_by_pk?: Maybe<Analytics_Logs>;
  /** update data of the table: "blpu_codes" */
  update_blpu_codes?: Maybe<Blpu_Codes_Mutation_Response>;
  /** update single row of the table: "blpu_codes" */
  update_blpu_codes_by_pk?: Maybe<Blpu_Codes>;
  /** update data of the table: "bops_applications" */
  update_bops_applications?: Maybe<Bops_Applications_Mutation_Response>;
  /** update single row of the table: "bops_applications" */
  update_bops_applications_by_pk?: Maybe<Bops_Applications>;
  /** update data of the table: "flow_schemas" */
  update_flow_schemas?: Maybe<Flow_Schemas_Mutation_Response>;
  /** update single row of the table: "flow_schemas" */
  update_flow_schemas_by_pk?: Maybe<Flow_Schemas>;
  /** update data of the table: "flows" */
  update_flows?: Maybe<Flows_Mutation_Response>;
  /** update single row of the table: "flows" */
  update_flows_by_pk?: Maybe<Flows>;
  /** update data of the table: "global_settings" */
  update_global_settings?: Maybe<Global_Settings_Mutation_Response>;
  /** update single row of the table: "global_settings" */
  update_global_settings_by_pk?: Maybe<Global_Settings>;
  /** update data of the table: "lowcal_sessions" */
  update_lowcal_sessions?: Maybe<Lowcal_Sessions_Mutation_Response>;
  /** update single row of the table: "lowcal_sessions" */
  update_lowcal_sessions_by_pk?: Maybe<Lowcal_Sessions>;
  /** update data of the table: "operations" */
  update_operations?: Maybe<Operations_Mutation_Response>;
  /** update single row of the table: "operations" */
  update_operations_by_pk?: Maybe<Operations>;
  /** update data of the table: "planning_constraints_requests" */
  update_planning_constraints_requests?: Maybe<Planning_Constraints_Requests_Mutation_Response>;
  /** update single row of the table: "planning_constraints_requests" */
  update_planning_constraints_requests_by_pk?: Maybe<Planning_Constraints_Requests>;
  /** update data of the table: "project_types" */
  update_project_types?: Maybe<Project_Types_Mutation_Response>;
  /** update single row of the table: "project_types" */
  update_project_types_by_pk?: Maybe<Project_Types>;
  /** update data of the table: "published_flows" */
  update_published_flows?: Maybe<Published_Flows_Mutation_Response>;
  /** update single row of the table: "published_flows" */
  update_published_flows_by_pk?: Maybe<Published_Flows>;
  /** update data of the table: "reconciliation_requests" */
  update_reconciliation_requests?: Maybe<Reconciliation_Requests_Mutation_Response>;
  /** update single row of the table: "reconciliation_requests" */
  update_reconciliation_requests_by_pk?: Maybe<Reconciliation_Requests>;
  /** update data of the table: "session_backups" */
  update_session_backups?: Maybe<Session_Backups_Mutation_Response>;
  /** update single row of the table: "session_backups" */
  update_session_backups_by_pk?: Maybe<Session_Backups>;
  /** update data of the table: "team_members" */
  update_team_members?: Maybe<Team_Members_Mutation_Response>;
  /** update single row of the table: "team_members" */
  update_team_members_by_pk?: Maybe<Team_Members>;
  /** update data of the table: "teams" */
  update_teams?: Maybe<Teams_Mutation_Response>;
  /** update single row of the table: "teams" */
  update_teams_by_pk?: Maybe<Teams>;
  /** update data of the table: "uniform_applications" */
  update_uniform_applications?: Maybe<Uniform_Applications_Mutation_Response>;
  /** update single row of the table: "uniform_applications" */
  update_uniform_applications_by_pk?: Maybe<Uniform_Applications>;
  /** update data of the table: "users" */
  update_users?: Maybe<Users_Mutation_Response>;
  /** update single row of the table: "users" */
  update_users_by_pk?: Maybe<Users>;
};


/** mutation root */
export type Mutation_RootDelete_AnalyticsArgs = {
  where: Analytics_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Analytics_By_PkArgs = {
  id: Scalars['bigint'];
};


/** mutation root */
export type Mutation_RootDelete_Analytics_LogsArgs = {
  where: Analytics_Logs_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Analytics_Logs_By_PkArgs = {
  id: Scalars['bigint'];
};


/** mutation root */
export type Mutation_RootDelete_Blpu_CodesArgs = {
  where: Blpu_Codes_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Blpu_Codes_By_PkArgs = {
  code: Scalars['String'];
};


/** mutation root */
export type Mutation_RootDelete_Bops_ApplicationsArgs = {
  where: Bops_Applications_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Bops_Applications_By_PkArgs = {
  id: Scalars['Int'];
};


/** mutation root */
export type Mutation_RootDelete_Flow_SchemasArgs = {
  where: Flow_Schemas_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Flow_Schemas_By_PkArgs = {
  flow_id: Scalars['uuid'];
  node: Scalars['String'];
};


/** mutation root */
export type Mutation_RootDelete_FlowsArgs = {
  where: Flows_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Flows_By_PkArgs = {
  id: Scalars['uuid'];
};


/** mutation root */
export type Mutation_RootDelete_Global_SettingsArgs = {
  where: Global_Settings_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Global_Settings_By_PkArgs = {
  id: Scalars['Int'];
};


/** mutation root */
export type Mutation_RootDelete_Lowcal_SessionsArgs = {
  where: Lowcal_Sessions_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Lowcal_Sessions_By_PkArgs = {
  id: Scalars['uuid'];
};


/** mutation root */
export type Mutation_RootDelete_OperationsArgs = {
  where: Operations_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Operations_By_PkArgs = {
  id: Scalars['bigint'];
};


/** mutation root */
export type Mutation_RootDelete_Planning_Constraints_RequestsArgs = {
  where: Planning_Constraints_Requests_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Planning_Constraints_Requests_By_PkArgs = {
  id: Scalars['Int'];
};


/** mutation root */
export type Mutation_RootDelete_Project_TypesArgs = {
  where: Project_Types_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Project_Types_By_PkArgs = {
  id: Scalars['Int'];
};


/** mutation root */
export type Mutation_RootDelete_Published_FlowsArgs = {
  where: Published_Flows_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Published_Flows_By_PkArgs = {
  id: Scalars['Int'];
};


/** mutation root */
export type Mutation_RootDelete_Reconciliation_RequestsArgs = {
  where: Reconciliation_Requests_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Reconciliation_Requests_By_PkArgs = {
  id: Scalars['Int'];
};


/** mutation root */
export type Mutation_RootDelete_Session_BackupsArgs = {
  where: Session_Backups_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Session_Backups_By_PkArgs = {
  id: Scalars['Int'];
};


/** mutation root */
export type Mutation_RootDelete_Team_MembersArgs = {
  where: Team_Members_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Team_Members_By_PkArgs = {
  team_id: Scalars['Int'];
  user_id: Scalars['Int'];
};


/** mutation root */
export type Mutation_RootDelete_TeamsArgs = {
  where: Teams_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Teams_By_PkArgs = {
  id: Scalars['Int'];
};


/** mutation root */
export type Mutation_RootDelete_Uniform_ApplicationsArgs = {
  where: Uniform_Applications_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Uniform_Applications_By_PkArgs = {
  id: Scalars['Int'];
};


/** mutation root */
export type Mutation_RootDelete_UsersArgs = {
  where: Users_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Users_By_PkArgs = {
  id: Scalars['Int'];
};


/** mutation root */
export type Mutation_RootInsert_AnalyticsArgs = {
  objects: Array<Analytics_Insert_Input>;
  on_conflict?: InputMaybe<Analytics_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Analytics_LogsArgs = {
  objects: Array<Analytics_Logs_Insert_Input>;
  on_conflict?: InputMaybe<Analytics_Logs_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Analytics_Logs_OneArgs = {
  object: Analytics_Logs_Insert_Input;
  on_conflict?: InputMaybe<Analytics_Logs_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Analytics_OneArgs = {
  object: Analytics_Insert_Input;
  on_conflict?: InputMaybe<Analytics_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Blpu_CodesArgs = {
  objects: Array<Blpu_Codes_Insert_Input>;
  on_conflict?: InputMaybe<Blpu_Codes_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Blpu_Codes_OneArgs = {
  object: Blpu_Codes_Insert_Input;
  on_conflict?: InputMaybe<Blpu_Codes_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Bops_ApplicationsArgs = {
  objects: Array<Bops_Applications_Insert_Input>;
  on_conflict?: InputMaybe<Bops_Applications_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Bops_Applications_OneArgs = {
  object: Bops_Applications_Insert_Input;
  on_conflict?: InputMaybe<Bops_Applications_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Flow_SchemasArgs = {
  objects: Array<Flow_Schemas_Insert_Input>;
  on_conflict?: InputMaybe<Flow_Schemas_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Flow_Schemas_OneArgs = {
  object: Flow_Schemas_Insert_Input;
  on_conflict?: InputMaybe<Flow_Schemas_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_FlowsArgs = {
  objects: Array<Flows_Insert_Input>;
  on_conflict?: InputMaybe<Flows_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Flows_OneArgs = {
  object: Flows_Insert_Input;
  on_conflict?: InputMaybe<Flows_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Global_SettingsArgs = {
  objects: Array<Global_Settings_Insert_Input>;
  on_conflict?: InputMaybe<Global_Settings_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Global_Settings_OneArgs = {
  object: Global_Settings_Insert_Input;
  on_conflict?: InputMaybe<Global_Settings_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Lowcal_SessionsArgs = {
  objects: Array<Lowcal_Sessions_Insert_Input>;
  on_conflict?: InputMaybe<Lowcal_Sessions_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Lowcal_Sessions_OneArgs = {
  object: Lowcal_Sessions_Insert_Input;
  on_conflict?: InputMaybe<Lowcal_Sessions_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_OperationsArgs = {
  objects: Array<Operations_Insert_Input>;
  on_conflict?: InputMaybe<Operations_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Operations_OneArgs = {
  object: Operations_Insert_Input;
  on_conflict?: InputMaybe<Operations_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Planning_Constraints_RequestsArgs = {
  objects: Array<Planning_Constraints_Requests_Insert_Input>;
  on_conflict?: InputMaybe<Planning_Constraints_Requests_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Planning_Constraints_Requests_OneArgs = {
  object: Planning_Constraints_Requests_Insert_Input;
  on_conflict?: InputMaybe<Planning_Constraints_Requests_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Project_TypesArgs = {
  objects: Array<Project_Types_Insert_Input>;
  on_conflict?: InputMaybe<Project_Types_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Project_Types_OneArgs = {
  object: Project_Types_Insert_Input;
  on_conflict?: InputMaybe<Project_Types_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Published_FlowsArgs = {
  objects: Array<Published_Flows_Insert_Input>;
  on_conflict?: InputMaybe<Published_Flows_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Published_Flows_OneArgs = {
  object: Published_Flows_Insert_Input;
  on_conflict?: InputMaybe<Published_Flows_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Reconciliation_RequestsArgs = {
  objects: Array<Reconciliation_Requests_Insert_Input>;
  on_conflict?: InputMaybe<Reconciliation_Requests_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Reconciliation_Requests_OneArgs = {
  object: Reconciliation_Requests_Insert_Input;
  on_conflict?: InputMaybe<Reconciliation_Requests_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Session_BackupsArgs = {
  objects: Array<Session_Backups_Insert_Input>;
  on_conflict?: InputMaybe<Session_Backups_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Session_Backups_OneArgs = {
  object: Session_Backups_Insert_Input;
  on_conflict?: InputMaybe<Session_Backups_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Team_MembersArgs = {
  objects: Array<Team_Members_Insert_Input>;
  on_conflict?: InputMaybe<Team_Members_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Team_Members_OneArgs = {
  object: Team_Members_Insert_Input;
  on_conflict?: InputMaybe<Team_Members_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_TeamsArgs = {
  objects: Array<Teams_Insert_Input>;
  on_conflict?: InputMaybe<Teams_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Teams_OneArgs = {
  object: Teams_Insert_Input;
  on_conflict?: InputMaybe<Teams_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Uniform_ApplicationsArgs = {
  objects: Array<Uniform_Applications_Insert_Input>;
  on_conflict?: InputMaybe<Uniform_Applications_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Uniform_Applications_OneArgs = {
  object: Uniform_Applications_Insert_Input;
  on_conflict?: InputMaybe<Uniform_Applications_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_UsersArgs = {
  objects: Array<Users_Insert_Input>;
  on_conflict?: InputMaybe<Users_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Users_OneArgs = {
  object: Users_Insert_Input;
  on_conflict?: InputMaybe<Users_On_Conflict>;
};


/** mutation root */
export type Mutation_RootUpdate_AnalyticsArgs = {
  _inc?: InputMaybe<Analytics_Inc_Input>;
  _set?: InputMaybe<Analytics_Set_Input>;
  where: Analytics_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Analytics_By_PkArgs = {
  _inc?: InputMaybe<Analytics_Inc_Input>;
  _set?: InputMaybe<Analytics_Set_Input>;
  pk_columns: Analytics_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Analytics_LogsArgs = {
  _append?: InputMaybe<Analytics_Logs_Append_Input>;
  _delete_at_path?: InputMaybe<Analytics_Logs_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Analytics_Logs_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Analytics_Logs_Delete_Key_Input>;
  _inc?: InputMaybe<Analytics_Logs_Inc_Input>;
  _prepend?: InputMaybe<Analytics_Logs_Prepend_Input>;
  _set?: InputMaybe<Analytics_Logs_Set_Input>;
  where: Analytics_Logs_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Analytics_Logs_By_PkArgs = {
  _append?: InputMaybe<Analytics_Logs_Append_Input>;
  _delete_at_path?: InputMaybe<Analytics_Logs_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Analytics_Logs_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Analytics_Logs_Delete_Key_Input>;
  _inc?: InputMaybe<Analytics_Logs_Inc_Input>;
  _prepend?: InputMaybe<Analytics_Logs_Prepend_Input>;
  _set?: InputMaybe<Analytics_Logs_Set_Input>;
  pk_columns: Analytics_Logs_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Blpu_CodesArgs = {
  _set?: InputMaybe<Blpu_Codes_Set_Input>;
  where: Blpu_Codes_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Blpu_Codes_By_PkArgs = {
  _set?: InputMaybe<Blpu_Codes_Set_Input>;
  pk_columns: Blpu_Codes_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Bops_ApplicationsArgs = {
  _append?: InputMaybe<Bops_Applications_Append_Input>;
  _delete_at_path?: InputMaybe<Bops_Applications_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Bops_Applications_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Bops_Applications_Delete_Key_Input>;
  _inc?: InputMaybe<Bops_Applications_Inc_Input>;
  _prepend?: InputMaybe<Bops_Applications_Prepend_Input>;
  _set?: InputMaybe<Bops_Applications_Set_Input>;
  where: Bops_Applications_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Bops_Applications_By_PkArgs = {
  _append?: InputMaybe<Bops_Applications_Append_Input>;
  _delete_at_path?: InputMaybe<Bops_Applications_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Bops_Applications_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Bops_Applications_Delete_Key_Input>;
  _inc?: InputMaybe<Bops_Applications_Inc_Input>;
  _prepend?: InputMaybe<Bops_Applications_Prepend_Input>;
  _set?: InputMaybe<Bops_Applications_Set_Input>;
  pk_columns: Bops_Applications_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Flow_SchemasArgs = {
  _inc?: InputMaybe<Flow_Schemas_Inc_Input>;
  _set?: InputMaybe<Flow_Schemas_Set_Input>;
  where: Flow_Schemas_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Flow_Schemas_By_PkArgs = {
  _inc?: InputMaybe<Flow_Schemas_Inc_Input>;
  _set?: InputMaybe<Flow_Schemas_Set_Input>;
  pk_columns: Flow_Schemas_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_FlowsArgs = {
  _append?: InputMaybe<Flows_Append_Input>;
  _delete_at_path?: InputMaybe<Flows_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Flows_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Flows_Delete_Key_Input>;
  _inc?: InputMaybe<Flows_Inc_Input>;
  _prepend?: InputMaybe<Flows_Prepend_Input>;
  _set?: InputMaybe<Flows_Set_Input>;
  where: Flows_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Flows_By_PkArgs = {
  _append?: InputMaybe<Flows_Append_Input>;
  _delete_at_path?: InputMaybe<Flows_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Flows_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Flows_Delete_Key_Input>;
  _inc?: InputMaybe<Flows_Inc_Input>;
  _prepend?: InputMaybe<Flows_Prepend_Input>;
  _set?: InputMaybe<Flows_Set_Input>;
  pk_columns: Flows_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Global_SettingsArgs = {
  _append?: InputMaybe<Global_Settings_Append_Input>;
  _delete_at_path?: InputMaybe<Global_Settings_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Global_Settings_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Global_Settings_Delete_Key_Input>;
  _inc?: InputMaybe<Global_Settings_Inc_Input>;
  _prepend?: InputMaybe<Global_Settings_Prepend_Input>;
  _set?: InputMaybe<Global_Settings_Set_Input>;
  where: Global_Settings_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Global_Settings_By_PkArgs = {
  _append?: InputMaybe<Global_Settings_Append_Input>;
  _delete_at_path?: InputMaybe<Global_Settings_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Global_Settings_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Global_Settings_Delete_Key_Input>;
  _inc?: InputMaybe<Global_Settings_Inc_Input>;
  _prepend?: InputMaybe<Global_Settings_Prepend_Input>;
  _set?: InputMaybe<Global_Settings_Set_Input>;
  pk_columns: Global_Settings_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Lowcal_SessionsArgs = {
  _append?: InputMaybe<Lowcal_Sessions_Append_Input>;
  _delete_at_path?: InputMaybe<Lowcal_Sessions_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Lowcal_Sessions_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Lowcal_Sessions_Delete_Key_Input>;
  _prepend?: InputMaybe<Lowcal_Sessions_Prepend_Input>;
  _set?: InputMaybe<Lowcal_Sessions_Set_Input>;
  where: Lowcal_Sessions_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Lowcal_Sessions_By_PkArgs = {
  _append?: InputMaybe<Lowcal_Sessions_Append_Input>;
  _delete_at_path?: InputMaybe<Lowcal_Sessions_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Lowcal_Sessions_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Lowcal_Sessions_Delete_Key_Input>;
  _prepend?: InputMaybe<Lowcal_Sessions_Prepend_Input>;
  _set?: InputMaybe<Lowcal_Sessions_Set_Input>;
  pk_columns: Lowcal_Sessions_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_OperationsArgs = {
  _append?: InputMaybe<Operations_Append_Input>;
  _delete_at_path?: InputMaybe<Operations_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Operations_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Operations_Delete_Key_Input>;
  _inc?: InputMaybe<Operations_Inc_Input>;
  _prepend?: InputMaybe<Operations_Prepend_Input>;
  _set?: InputMaybe<Operations_Set_Input>;
  where: Operations_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Operations_By_PkArgs = {
  _append?: InputMaybe<Operations_Append_Input>;
  _delete_at_path?: InputMaybe<Operations_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Operations_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Operations_Delete_Key_Input>;
  _inc?: InputMaybe<Operations_Inc_Input>;
  _prepend?: InputMaybe<Operations_Prepend_Input>;
  _set?: InputMaybe<Operations_Set_Input>;
  pk_columns: Operations_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Planning_Constraints_RequestsArgs = {
  _append?: InputMaybe<Planning_Constraints_Requests_Append_Input>;
  _delete_at_path?: InputMaybe<Planning_Constraints_Requests_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Planning_Constraints_Requests_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Planning_Constraints_Requests_Delete_Key_Input>;
  _inc?: InputMaybe<Planning_Constraints_Requests_Inc_Input>;
  _prepend?: InputMaybe<Planning_Constraints_Requests_Prepend_Input>;
  _set?: InputMaybe<Planning_Constraints_Requests_Set_Input>;
  where: Planning_Constraints_Requests_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Planning_Constraints_Requests_By_PkArgs = {
  _append?: InputMaybe<Planning_Constraints_Requests_Append_Input>;
  _delete_at_path?: InputMaybe<Planning_Constraints_Requests_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Planning_Constraints_Requests_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Planning_Constraints_Requests_Delete_Key_Input>;
  _inc?: InputMaybe<Planning_Constraints_Requests_Inc_Input>;
  _prepend?: InputMaybe<Planning_Constraints_Requests_Prepend_Input>;
  _set?: InputMaybe<Planning_Constraints_Requests_Set_Input>;
  pk_columns: Planning_Constraints_Requests_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Project_TypesArgs = {
  _inc?: InputMaybe<Project_Types_Inc_Input>;
  _set?: InputMaybe<Project_Types_Set_Input>;
  where: Project_Types_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Project_Types_By_PkArgs = {
  _inc?: InputMaybe<Project_Types_Inc_Input>;
  _set?: InputMaybe<Project_Types_Set_Input>;
  pk_columns: Project_Types_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Published_FlowsArgs = {
  _append?: InputMaybe<Published_Flows_Append_Input>;
  _delete_at_path?: InputMaybe<Published_Flows_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Published_Flows_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Published_Flows_Delete_Key_Input>;
  _inc?: InputMaybe<Published_Flows_Inc_Input>;
  _prepend?: InputMaybe<Published_Flows_Prepend_Input>;
  _set?: InputMaybe<Published_Flows_Set_Input>;
  where: Published_Flows_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Published_Flows_By_PkArgs = {
  _append?: InputMaybe<Published_Flows_Append_Input>;
  _delete_at_path?: InputMaybe<Published_Flows_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Published_Flows_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Published_Flows_Delete_Key_Input>;
  _inc?: InputMaybe<Published_Flows_Inc_Input>;
  _prepend?: InputMaybe<Published_Flows_Prepend_Input>;
  _set?: InputMaybe<Published_Flows_Set_Input>;
  pk_columns: Published_Flows_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Reconciliation_RequestsArgs = {
  _append?: InputMaybe<Reconciliation_Requests_Append_Input>;
  _delete_at_path?: InputMaybe<Reconciliation_Requests_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Reconciliation_Requests_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Reconciliation_Requests_Delete_Key_Input>;
  _inc?: InputMaybe<Reconciliation_Requests_Inc_Input>;
  _prepend?: InputMaybe<Reconciliation_Requests_Prepend_Input>;
  _set?: InputMaybe<Reconciliation_Requests_Set_Input>;
  where: Reconciliation_Requests_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Reconciliation_Requests_By_PkArgs = {
  _append?: InputMaybe<Reconciliation_Requests_Append_Input>;
  _delete_at_path?: InputMaybe<Reconciliation_Requests_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Reconciliation_Requests_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Reconciliation_Requests_Delete_Key_Input>;
  _inc?: InputMaybe<Reconciliation_Requests_Inc_Input>;
  _prepend?: InputMaybe<Reconciliation_Requests_Prepend_Input>;
  _set?: InputMaybe<Reconciliation_Requests_Set_Input>;
  pk_columns: Reconciliation_Requests_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Session_BackupsArgs = {
  _append?: InputMaybe<Session_Backups_Append_Input>;
  _delete_at_path?: InputMaybe<Session_Backups_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Session_Backups_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Session_Backups_Delete_Key_Input>;
  _inc?: InputMaybe<Session_Backups_Inc_Input>;
  _prepend?: InputMaybe<Session_Backups_Prepend_Input>;
  _set?: InputMaybe<Session_Backups_Set_Input>;
  where: Session_Backups_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Session_Backups_By_PkArgs = {
  _append?: InputMaybe<Session_Backups_Append_Input>;
  _delete_at_path?: InputMaybe<Session_Backups_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Session_Backups_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Session_Backups_Delete_Key_Input>;
  _inc?: InputMaybe<Session_Backups_Inc_Input>;
  _prepend?: InputMaybe<Session_Backups_Prepend_Input>;
  _set?: InputMaybe<Session_Backups_Set_Input>;
  pk_columns: Session_Backups_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Team_MembersArgs = {
  _inc?: InputMaybe<Team_Members_Inc_Input>;
  _set?: InputMaybe<Team_Members_Set_Input>;
  where: Team_Members_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Team_Members_By_PkArgs = {
  _inc?: InputMaybe<Team_Members_Inc_Input>;
  _set?: InputMaybe<Team_Members_Set_Input>;
  pk_columns: Team_Members_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_TeamsArgs = {
  _append?: InputMaybe<Teams_Append_Input>;
  _delete_at_path?: InputMaybe<Teams_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Teams_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Teams_Delete_Key_Input>;
  _inc?: InputMaybe<Teams_Inc_Input>;
  _prepend?: InputMaybe<Teams_Prepend_Input>;
  _set?: InputMaybe<Teams_Set_Input>;
  where: Teams_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Teams_By_PkArgs = {
  _append?: InputMaybe<Teams_Append_Input>;
  _delete_at_path?: InputMaybe<Teams_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Teams_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Teams_Delete_Key_Input>;
  _inc?: InputMaybe<Teams_Inc_Input>;
  _prepend?: InputMaybe<Teams_Prepend_Input>;
  _set?: InputMaybe<Teams_Set_Input>;
  pk_columns: Teams_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Uniform_ApplicationsArgs = {
  _append?: InputMaybe<Uniform_Applications_Append_Input>;
  _delete_at_path?: InputMaybe<Uniform_Applications_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Uniform_Applications_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Uniform_Applications_Delete_Key_Input>;
  _inc?: InputMaybe<Uniform_Applications_Inc_Input>;
  _prepend?: InputMaybe<Uniform_Applications_Prepend_Input>;
  _set?: InputMaybe<Uniform_Applications_Set_Input>;
  where: Uniform_Applications_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Uniform_Applications_By_PkArgs = {
  _append?: InputMaybe<Uniform_Applications_Append_Input>;
  _delete_at_path?: InputMaybe<Uniform_Applications_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Uniform_Applications_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Uniform_Applications_Delete_Key_Input>;
  _inc?: InputMaybe<Uniform_Applications_Inc_Input>;
  _prepend?: InputMaybe<Uniform_Applications_Prepend_Input>;
  _set?: InputMaybe<Uniform_Applications_Set_Input>;
  pk_columns: Uniform_Applications_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_UsersArgs = {
  _inc?: InputMaybe<Users_Inc_Input>;
  _set?: InputMaybe<Users_Set_Input>;
  where: Users_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Users_By_PkArgs = {
  _inc?: InputMaybe<Users_Inc_Input>;
  _set?: InputMaybe<Users_Set_Input>;
  pk_columns: Users_Pk_Columns_Input;
};

/** Represents individual changes to `flow` content, generated by ShareDB Postgres adapter using JSON operational transformation (OT) */
export type Operations = {
  __typename?: 'operations';
  /** An object relationship */
  actor?: Maybe<Users>;
  actor_id?: Maybe<Scalars['Int']>;
  created_at: Scalars['timestamptz'];
  data: Scalars['jsonb'];
  /** An object relationship */
  flow?: Maybe<Flows>;
  flow_id?: Maybe<Scalars['uuid']>;
  id: Scalars['bigint'];
  updated_at: Scalars['timestamptz'];
  version?: Maybe<Scalars['Int']>;
};


/** Represents individual changes to `flow` content, generated by ShareDB Postgres adapter using JSON operational transformation (OT) */
export type OperationsDataArgs = {
  path?: InputMaybe<Scalars['String']>;
};

/** aggregated selection of "operations" */
export type Operations_Aggregate = {
  __typename?: 'operations_aggregate';
  aggregate?: Maybe<Operations_Aggregate_Fields>;
  nodes: Array<Operations>;
};

/** aggregate fields of "operations" */
export type Operations_Aggregate_Fields = {
  __typename?: 'operations_aggregate_fields';
  avg?: Maybe<Operations_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<Operations_Max_Fields>;
  min?: Maybe<Operations_Min_Fields>;
  stddev?: Maybe<Operations_Stddev_Fields>;
  stddev_pop?: Maybe<Operations_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Operations_Stddev_Samp_Fields>;
  sum?: Maybe<Operations_Sum_Fields>;
  var_pop?: Maybe<Operations_Var_Pop_Fields>;
  var_samp?: Maybe<Operations_Var_Samp_Fields>;
  variance?: Maybe<Operations_Variance_Fields>;
};


/** aggregate fields of "operations" */
export type Operations_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Operations_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "operations" */
export type Operations_Aggregate_Order_By = {
  avg?: InputMaybe<Operations_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Operations_Max_Order_By>;
  min?: InputMaybe<Operations_Min_Order_By>;
  stddev?: InputMaybe<Operations_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Operations_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Operations_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Operations_Sum_Order_By>;
  var_pop?: InputMaybe<Operations_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Operations_Var_Samp_Order_By>;
  variance?: InputMaybe<Operations_Variance_Order_By>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Operations_Append_Input = {
  data?: InputMaybe<Scalars['jsonb']>;
};

/** input type for inserting array relation for remote table "operations" */
export type Operations_Arr_Rel_Insert_Input = {
  data: Array<Operations_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Operations_On_Conflict>;
};

/** aggregate avg on columns */
export type Operations_Avg_Fields = {
  __typename?: 'operations_avg_fields';
  actor_id?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  version?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "operations" */
export type Operations_Avg_Order_By = {
  actor_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  version?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "operations". All fields are combined with a logical 'AND'. */
export type Operations_Bool_Exp = {
  _and?: InputMaybe<Array<Operations_Bool_Exp>>;
  _not?: InputMaybe<Operations_Bool_Exp>;
  _or?: InputMaybe<Array<Operations_Bool_Exp>>;
  actor?: InputMaybe<Users_Bool_Exp>;
  actor_id?: InputMaybe<Int_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  data?: InputMaybe<Jsonb_Comparison_Exp>;
  flow?: InputMaybe<Flows_Bool_Exp>;
  flow_id?: InputMaybe<Uuid_Comparison_Exp>;
  id?: InputMaybe<Bigint_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  version?: InputMaybe<Int_Comparison_Exp>;
};

/** unique or primary key constraints on table "operations" */
export enum Operations_Constraint {
  /** unique or primary key constraint on columns "flow_id", "version" */
  OperationsFlowIdVersionKey = 'operations_flow_id_version_key',
  /** unique or primary key constraint on columns "id" */
  OperationsPkey = 'operations_pkey'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Operations_Delete_At_Path_Input = {
  data?: InputMaybe<Array<Scalars['String']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Operations_Delete_Elem_Input = {
  data?: InputMaybe<Scalars['Int']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Operations_Delete_Key_Input = {
  data?: InputMaybe<Scalars['String']>;
};

/** input type for incrementing numeric columns in table "operations" */
export type Operations_Inc_Input = {
  actor_id?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['bigint']>;
  version?: InputMaybe<Scalars['Int']>;
};

/** input type for inserting data into table "operations" */
export type Operations_Insert_Input = {
  actor?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  actor_id?: InputMaybe<Scalars['Int']>;
  created_at?: InputMaybe<Scalars['timestamptz']>;
  data?: InputMaybe<Scalars['jsonb']>;
  flow?: InputMaybe<Flows_Obj_Rel_Insert_Input>;
  flow_id?: InputMaybe<Scalars['uuid']>;
  id?: InputMaybe<Scalars['bigint']>;
  updated_at?: InputMaybe<Scalars['timestamptz']>;
  version?: InputMaybe<Scalars['Int']>;
};

/** aggregate max on columns */
export type Operations_Max_Fields = {
  __typename?: 'operations_max_fields';
  actor_id?: Maybe<Scalars['Int']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  flow_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['bigint']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
  version?: Maybe<Scalars['Int']>;
};

/** order by max() on columns of table "operations" */
export type Operations_Max_Order_By = {
  actor_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  flow_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  version?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Operations_Min_Fields = {
  __typename?: 'operations_min_fields';
  actor_id?: Maybe<Scalars['Int']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  flow_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['bigint']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
  version?: Maybe<Scalars['Int']>;
};

/** order by min() on columns of table "operations" */
export type Operations_Min_Order_By = {
  actor_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  flow_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  version?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "operations" */
export type Operations_Mutation_Response = {
  __typename?: 'operations_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Operations>;
};

/** on_conflict condition type for table "operations" */
export type Operations_On_Conflict = {
  constraint: Operations_Constraint;
  update_columns?: Array<Operations_Update_Column>;
  where?: InputMaybe<Operations_Bool_Exp>;
};

/** Ordering options when selecting data from "operations". */
export type Operations_Order_By = {
  actor?: InputMaybe<Users_Order_By>;
  actor_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  data?: InputMaybe<Order_By>;
  flow?: InputMaybe<Flows_Order_By>;
  flow_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  version?: InputMaybe<Order_By>;
};

/** primary key columns input for table: operations */
export type Operations_Pk_Columns_Input = {
  id: Scalars['bigint'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Operations_Prepend_Input = {
  data?: InputMaybe<Scalars['jsonb']>;
};

/** select columns of table "operations" */
export enum Operations_Select_Column {
  /** column name */
  ActorId = 'actor_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Data = 'data',
  /** column name */
  FlowId = 'flow_id',
  /** column name */
  Id = 'id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  Version = 'version'
}

/** input type for updating data in table "operations" */
export type Operations_Set_Input = {
  actor_id?: InputMaybe<Scalars['Int']>;
  created_at?: InputMaybe<Scalars['timestamptz']>;
  data?: InputMaybe<Scalars['jsonb']>;
  flow_id?: InputMaybe<Scalars['uuid']>;
  id?: InputMaybe<Scalars['bigint']>;
  updated_at?: InputMaybe<Scalars['timestamptz']>;
  version?: InputMaybe<Scalars['Int']>;
};

/** aggregate stddev on columns */
export type Operations_Stddev_Fields = {
  __typename?: 'operations_stddev_fields';
  actor_id?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  version?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "operations" */
export type Operations_Stddev_Order_By = {
  actor_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  version?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Operations_Stddev_Pop_Fields = {
  __typename?: 'operations_stddev_pop_fields';
  actor_id?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  version?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "operations" */
export type Operations_Stddev_Pop_Order_By = {
  actor_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  version?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Operations_Stddev_Samp_Fields = {
  __typename?: 'operations_stddev_samp_fields';
  actor_id?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  version?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "operations" */
export type Operations_Stddev_Samp_Order_By = {
  actor_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  version?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type Operations_Sum_Fields = {
  __typename?: 'operations_sum_fields';
  actor_id?: Maybe<Scalars['Int']>;
  id?: Maybe<Scalars['bigint']>;
  version?: Maybe<Scalars['Int']>;
};

/** order by sum() on columns of table "operations" */
export type Operations_Sum_Order_By = {
  actor_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  version?: InputMaybe<Order_By>;
};

/** update columns of table "operations" */
export enum Operations_Update_Column {
  /** column name */
  ActorId = 'actor_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Data = 'data',
  /** column name */
  FlowId = 'flow_id',
  /** column name */
  Id = 'id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  Version = 'version'
}

/** aggregate var_pop on columns */
export type Operations_Var_Pop_Fields = {
  __typename?: 'operations_var_pop_fields';
  actor_id?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  version?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "operations" */
export type Operations_Var_Pop_Order_By = {
  actor_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  version?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Operations_Var_Samp_Fields = {
  __typename?: 'operations_var_samp_fields';
  actor_id?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  version?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "operations" */
export type Operations_Var_Samp_Order_By = {
  actor_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  version?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Operations_Variance_Fields = {
  __typename?: 'operations_variance_fields';
  actor_id?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  version?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "operations" */
export type Operations_Variance_Order_By = {
  actor_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  version?: InputMaybe<Order_By>;
};

/** column ordering options */
export enum Order_By {
  /** in ascending order, nulls last */
  Asc = 'asc',
  /** in ascending order, nulls first */
  AscNullsFirst = 'asc_nulls_first',
  /** in ascending order, nulls last */
  AscNullsLast = 'asc_nulls_last',
  /** in descending order, nulls first */
  Desc = 'desc',
  /** in descending order, nulls first */
  DescNullsFirst = 'desc_nulls_first',
  /** in descending order, nulls last */
  DescNullsLast = 'desc_nulls_last'
}

/** Audit log of raw planning constraints responses from Digital Land API */
export type Planning_Constraints_Requests = {
  __typename?: 'planning_constraints_requests';
  created_at: Scalars['timestamptz'];
  destination_url?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  response?: Maybe<Scalars['jsonb']>;
  session_id?: Maybe<Scalars['String']>;
};


/** Audit log of raw planning constraints responses from Digital Land API */
export type Planning_Constraints_RequestsResponseArgs = {
  path?: InputMaybe<Scalars['String']>;
};

/** aggregated selection of "planning_constraints_requests" */
export type Planning_Constraints_Requests_Aggregate = {
  __typename?: 'planning_constraints_requests_aggregate';
  aggregate?: Maybe<Planning_Constraints_Requests_Aggregate_Fields>;
  nodes: Array<Planning_Constraints_Requests>;
};

/** aggregate fields of "planning_constraints_requests" */
export type Planning_Constraints_Requests_Aggregate_Fields = {
  __typename?: 'planning_constraints_requests_aggregate_fields';
  avg?: Maybe<Planning_Constraints_Requests_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<Planning_Constraints_Requests_Max_Fields>;
  min?: Maybe<Planning_Constraints_Requests_Min_Fields>;
  stddev?: Maybe<Planning_Constraints_Requests_Stddev_Fields>;
  stddev_pop?: Maybe<Planning_Constraints_Requests_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Planning_Constraints_Requests_Stddev_Samp_Fields>;
  sum?: Maybe<Planning_Constraints_Requests_Sum_Fields>;
  var_pop?: Maybe<Planning_Constraints_Requests_Var_Pop_Fields>;
  var_samp?: Maybe<Planning_Constraints_Requests_Var_Samp_Fields>;
  variance?: Maybe<Planning_Constraints_Requests_Variance_Fields>;
};


/** aggregate fields of "planning_constraints_requests" */
export type Planning_Constraints_Requests_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Planning_Constraints_Requests_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Planning_Constraints_Requests_Append_Input = {
  response?: InputMaybe<Scalars['jsonb']>;
};

/** aggregate avg on columns */
export type Planning_Constraints_Requests_Avg_Fields = {
  __typename?: 'planning_constraints_requests_avg_fields';
  id?: Maybe<Scalars['Float']>;
};

/** Boolean expression to filter rows from the table "planning_constraints_requests". All fields are combined with a logical 'AND'. */
export type Planning_Constraints_Requests_Bool_Exp = {
  _and?: InputMaybe<Array<Planning_Constraints_Requests_Bool_Exp>>;
  _not?: InputMaybe<Planning_Constraints_Requests_Bool_Exp>;
  _or?: InputMaybe<Array<Planning_Constraints_Requests_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  destination_url?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  response?: InputMaybe<Jsonb_Comparison_Exp>;
  session_id?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "planning_constraints_requests" */
export enum Planning_Constraints_Requests_Constraint {
  /** unique or primary key constraint on columns "id" */
  PlanningConstraintsRequestsPkey = 'planning_constraints_requests_pkey'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Planning_Constraints_Requests_Delete_At_Path_Input = {
  response?: InputMaybe<Array<Scalars['String']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Planning_Constraints_Requests_Delete_Elem_Input = {
  response?: InputMaybe<Scalars['Int']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Planning_Constraints_Requests_Delete_Key_Input = {
  response?: InputMaybe<Scalars['String']>;
};

/** input type for incrementing numeric columns in table "planning_constraints_requests" */
export type Planning_Constraints_Requests_Inc_Input = {
  id?: InputMaybe<Scalars['Int']>;
};

/** input type for inserting data into table "planning_constraints_requests" */
export type Planning_Constraints_Requests_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']>;
  destination_url?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Int']>;
  response?: InputMaybe<Scalars['jsonb']>;
  session_id?: InputMaybe<Scalars['String']>;
};

/** aggregate max on columns */
export type Planning_Constraints_Requests_Max_Fields = {
  __typename?: 'planning_constraints_requests_max_fields';
  created_at?: Maybe<Scalars['timestamptz']>;
  destination_url?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Int']>;
  session_id?: Maybe<Scalars['String']>;
};

/** aggregate min on columns */
export type Planning_Constraints_Requests_Min_Fields = {
  __typename?: 'planning_constraints_requests_min_fields';
  created_at?: Maybe<Scalars['timestamptz']>;
  destination_url?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Int']>;
  session_id?: Maybe<Scalars['String']>;
};

/** response of any mutation on the table "planning_constraints_requests" */
export type Planning_Constraints_Requests_Mutation_Response = {
  __typename?: 'planning_constraints_requests_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Planning_Constraints_Requests>;
};

/** on_conflict condition type for table "planning_constraints_requests" */
export type Planning_Constraints_Requests_On_Conflict = {
  constraint: Planning_Constraints_Requests_Constraint;
  update_columns?: Array<Planning_Constraints_Requests_Update_Column>;
  where?: InputMaybe<Planning_Constraints_Requests_Bool_Exp>;
};

/** Ordering options when selecting data from "planning_constraints_requests". */
export type Planning_Constraints_Requests_Order_By = {
  created_at?: InputMaybe<Order_By>;
  destination_url?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  response?: InputMaybe<Order_By>;
  session_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: planning_constraints_requests */
export type Planning_Constraints_Requests_Pk_Columns_Input = {
  id: Scalars['Int'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Planning_Constraints_Requests_Prepend_Input = {
  response?: InputMaybe<Scalars['jsonb']>;
};

/** select columns of table "planning_constraints_requests" */
export enum Planning_Constraints_Requests_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DestinationUrl = 'destination_url',
  /** column name */
  Id = 'id',
  /** column name */
  Response = 'response',
  /** column name */
  SessionId = 'session_id'
}

/** input type for updating data in table "planning_constraints_requests" */
export type Planning_Constraints_Requests_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']>;
  destination_url?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Int']>;
  response?: InputMaybe<Scalars['jsonb']>;
  session_id?: InputMaybe<Scalars['String']>;
};

/** aggregate stddev on columns */
export type Planning_Constraints_Requests_Stddev_Fields = {
  __typename?: 'planning_constraints_requests_stddev_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_pop on columns */
export type Planning_Constraints_Requests_Stddev_Pop_Fields = {
  __typename?: 'planning_constraints_requests_stddev_pop_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_samp on columns */
export type Planning_Constraints_Requests_Stddev_Samp_Fields = {
  __typename?: 'planning_constraints_requests_stddev_samp_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate sum on columns */
export type Planning_Constraints_Requests_Sum_Fields = {
  __typename?: 'planning_constraints_requests_sum_fields';
  id?: Maybe<Scalars['Int']>;
};

/** update columns of table "planning_constraints_requests" */
export enum Planning_Constraints_Requests_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DestinationUrl = 'destination_url',
  /** column name */
  Id = 'id',
  /** column name */
  Response = 'response',
  /** column name */
  SessionId = 'session_id'
}

/** aggregate var_pop on columns */
export type Planning_Constraints_Requests_Var_Pop_Fields = {
  __typename?: 'planning_constraints_requests_var_pop_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate var_samp on columns */
export type Planning_Constraints_Requests_Var_Samp_Fields = {
  __typename?: 'planning_constraints_requests_var_samp_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate variance on columns */
export type Planning_Constraints_Requests_Variance_Fields = {
  __typename?: 'planning_constraints_requests_variance_fields';
  id?: Maybe<Scalars['Float']>;
};

/** A list of things people want to do within the planning system */
export type Project_Types = {
  __typename?: 'project_types';
  description: Scalars['String'];
  id: Scalars['Int'];
  value: Scalars['String'];
};

/** aggregated selection of "project_types" */
export type Project_Types_Aggregate = {
  __typename?: 'project_types_aggregate';
  aggregate?: Maybe<Project_Types_Aggregate_Fields>;
  nodes: Array<Project_Types>;
};

/** aggregate fields of "project_types" */
export type Project_Types_Aggregate_Fields = {
  __typename?: 'project_types_aggregate_fields';
  avg?: Maybe<Project_Types_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<Project_Types_Max_Fields>;
  min?: Maybe<Project_Types_Min_Fields>;
  stddev?: Maybe<Project_Types_Stddev_Fields>;
  stddev_pop?: Maybe<Project_Types_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Project_Types_Stddev_Samp_Fields>;
  sum?: Maybe<Project_Types_Sum_Fields>;
  var_pop?: Maybe<Project_Types_Var_Pop_Fields>;
  var_samp?: Maybe<Project_Types_Var_Samp_Fields>;
  variance?: Maybe<Project_Types_Variance_Fields>;
};


/** aggregate fields of "project_types" */
export type Project_Types_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Project_Types_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** aggregate avg on columns */
export type Project_Types_Avg_Fields = {
  __typename?: 'project_types_avg_fields';
  id?: Maybe<Scalars['Float']>;
};

/** Boolean expression to filter rows from the table "project_types". All fields are combined with a logical 'AND'. */
export type Project_Types_Bool_Exp = {
  _and?: InputMaybe<Array<Project_Types_Bool_Exp>>;
  _not?: InputMaybe<Project_Types_Bool_Exp>;
  _or?: InputMaybe<Array<Project_Types_Bool_Exp>>;
  description?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  value?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "project_types" */
export enum Project_Types_Constraint {
  /** unique or primary key constraint on columns "id" */
  ProjectTypesPkey = 'project_types_pkey'
}

/** input type for incrementing numeric columns in table "project_types" */
export type Project_Types_Inc_Input = {
  id?: InputMaybe<Scalars['Int']>;
};

/** input type for inserting data into table "project_types" */
export type Project_Types_Insert_Input = {
  description?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Int']>;
  value?: InputMaybe<Scalars['String']>;
};

/** aggregate max on columns */
export type Project_Types_Max_Fields = {
  __typename?: 'project_types_max_fields';
  description?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Int']>;
  value?: Maybe<Scalars['String']>;
};

/** aggregate min on columns */
export type Project_Types_Min_Fields = {
  __typename?: 'project_types_min_fields';
  description?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Int']>;
  value?: Maybe<Scalars['String']>;
};

/** response of any mutation on the table "project_types" */
export type Project_Types_Mutation_Response = {
  __typename?: 'project_types_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Project_Types>;
};

/** on_conflict condition type for table "project_types" */
export type Project_Types_On_Conflict = {
  constraint: Project_Types_Constraint;
  update_columns?: Array<Project_Types_Update_Column>;
  where?: InputMaybe<Project_Types_Bool_Exp>;
};

/** Ordering options when selecting data from "project_types". */
export type Project_Types_Order_By = {
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** primary key columns input for table: project_types */
export type Project_Types_Pk_Columns_Input = {
  id: Scalars['Int'];
};

/** select columns of table "project_types" */
export enum Project_Types_Select_Column {
  /** column name */
  Description = 'description',
  /** column name */
  Id = 'id',
  /** column name */
  Value = 'value'
}

/** input type for updating data in table "project_types" */
export type Project_Types_Set_Input = {
  description?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Int']>;
  value?: InputMaybe<Scalars['String']>;
};

/** aggregate stddev on columns */
export type Project_Types_Stddev_Fields = {
  __typename?: 'project_types_stddev_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_pop on columns */
export type Project_Types_Stddev_Pop_Fields = {
  __typename?: 'project_types_stddev_pop_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_samp on columns */
export type Project_Types_Stddev_Samp_Fields = {
  __typename?: 'project_types_stddev_samp_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate sum on columns */
export type Project_Types_Sum_Fields = {
  __typename?: 'project_types_sum_fields';
  id?: Maybe<Scalars['Int']>;
};

/** update columns of table "project_types" */
export enum Project_Types_Update_Column {
  /** column name */
  Description = 'description',
  /** column name */
  Id = 'id',
  /** column name */
  Value = 'value'
}

/** aggregate var_pop on columns */
export type Project_Types_Var_Pop_Fields = {
  __typename?: 'project_types_var_pop_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate var_samp on columns */
export type Project_Types_Var_Samp_Fields = {
  __typename?: 'project_types_var_samp_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate variance on columns */
export type Project_Types_Variance_Fields = {
  __typename?: 'project_types_variance_fields';
  id?: Maybe<Scalars['Float']>;
};

/** Snapshots of flow content that are "live" to public users, links to `flows` */
export type Published_Flows = {
  __typename?: 'published_flows';
  created_at: Scalars['timestamptz'];
  /** Different than `flows`, published data are stored as "flattened" DAGs, meaning that the "_root" graph includes individual nodes from external portals */
  data: Scalars['jsonb'];
  /** An object relationship */
  flow: Flows;
  flow_id: Scalars['uuid'];
  id: Scalars['Int'];
  publisher_id: Scalars['Int'];
  summary?: Maybe<Scalars['String']>;
  /** An object relationship */
  user: Users;
};


/** Snapshots of flow content that are "live" to public users, links to `flows` */
export type Published_FlowsDataArgs = {
  path?: InputMaybe<Scalars['String']>;
};

/** aggregated selection of "published_flows" */
export type Published_Flows_Aggregate = {
  __typename?: 'published_flows_aggregate';
  aggregate?: Maybe<Published_Flows_Aggregate_Fields>;
  nodes: Array<Published_Flows>;
};

/** aggregate fields of "published_flows" */
export type Published_Flows_Aggregate_Fields = {
  __typename?: 'published_flows_aggregate_fields';
  avg?: Maybe<Published_Flows_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<Published_Flows_Max_Fields>;
  min?: Maybe<Published_Flows_Min_Fields>;
  stddev?: Maybe<Published_Flows_Stddev_Fields>;
  stddev_pop?: Maybe<Published_Flows_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Published_Flows_Stddev_Samp_Fields>;
  sum?: Maybe<Published_Flows_Sum_Fields>;
  var_pop?: Maybe<Published_Flows_Var_Pop_Fields>;
  var_samp?: Maybe<Published_Flows_Var_Samp_Fields>;
  variance?: Maybe<Published_Flows_Variance_Fields>;
};


/** aggregate fields of "published_flows" */
export type Published_Flows_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Published_Flows_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "published_flows" */
export type Published_Flows_Aggregate_Order_By = {
  avg?: InputMaybe<Published_Flows_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Published_Flows_Max_Order_By>;
  min?: InputMaybe<Published_Flows_Min_Order_By>;
  stddev?: InputMaybe<Published_Flows_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Published_Flows_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Published_Flows_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Published_Flows_Sum_Order_By>;
  var_pop?: InputMaybe<Published_Flows_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Published_Flows_Var_Samp_Order_By>;
  variance?: InputMaybe<Published_Flows_Variance_Order_By>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Published_Flows_Append_Input = {
  /** Different than `flows`, published data are stored as "flattened" DAGs, meaning that the "_root" graph includes individual nodes from external portals */
  data?: InputMaybe<Scalars['jsonb']>;
};

/** input type for inserting array relation for remote table "published_flows" */
export type Published_Flows_Arr_Rel_Insert_Input = {
  data: Array<Published_Flows_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Published_Flows_On_Conflict>;
};

/** aggregate avg on columns */
export type Published_Flows_Avg_Fields = {
  __typename?: 'published_flows_avg_fields';
  id?: Maybe<Scalars['Float']>;
  publisher_id?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "published_flows" */
export type Published_Flows_Avg_Order_By = {
  id?: InputMaybe<Order_By>;
  publisher_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "published_flows". All fields are combined with a logical 'AND'. */
export type Published_Flows_Bool_Exp = {
  _and?: InputMaybe<Array<Published_Flows_Bool_Exp>>;
  _not?: InputMaybe<Published_Flows_Bool_Exp>;
  _or?: InputMaybe<Array<Published_Flows_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  data?: InputMaybe<Jsonb_Comparison_Exp>;
  flow?: InputMaybe<Flows_Bool_Exp>;
  flow_id?: InputMaybe<Uuid_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  publisher_id?: InputMaybe<Int_Comparison_Exp>;
  summary?: InputMaybe<String_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
};

/** unique or primary key constraints on table "published_flows" */
export enum Published_Flows_Constraint {
  /** unique or primary key constraint on columns "id" */
  PublishedFlowsPkey = 'published_flows_pkey'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Published_Flows_Delete_At_Path_Input = {
  /** Different than `flows`, published data are stored as "flattened" DAGs, meaning that the "_root" graph includes individual nodes from external portals */
  data?: InputMaybe<Array<Scalars['String']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Published_Flows_Delete_Elem_Input = {
  /** Different than `flows`, published data are stored as "flattened" DAGs, meaning that the "_root" graph includes individual nodes from external portals */
  data?: InputMaybe<Scalars['Int']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Published_Flows_Delete_Key_Input = {
  /** Different than `flows`, published data are stored as "flattened" DAGs, meaning that the "_root" graph includes individual nodes from external portals */
  data?: InputMaybe<Scalars['String']>;
};

/** input type for incrementing numeric columns in table "published_flows" */
export type Published_Flows_Inc_Input = {
  id?: InputMaybe<Scalars['Int']>;
  publisher_id?: InputMaybe<Scalars['Int']>;
};

/** input type for inserting data into table "published_flows" */
export type Published_Flows_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']>;
  /** Different than `flows`, published data are stored as "flattened" DAGs, meaning that the "_root" graph includes individual nodes from external portals */
  data?: InputMaybe<Scalars['jsonb']>;
  flow?: InputMaybe<Flows_Obj_Rel_Insert_Input>;
  flow_id?: InputMaybe<Scalars['uuid']>;
  id?: InputMaybe<Scalars['Int']>;
  publisher_id?: InputMaybe<Scalars['Int']>;
  summary?: InputMaybe<Scalars['String']>;
  user?: InputMaybe<Users_Obj_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Published_Flows_Max_Fields = {
  __typename?: 'published_flows_max_fields';
  created_at?: Maybe<Scalars['timestamptz']>;
  flow_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['Int']>;
  publisher_id?: Maybe<Scalars['Int']>;
  summary?: Maybe<Scalars['String']>;
};

/** order by max() on columns of table "published_flows" */
export type Published_Flows_Max_Order_By = {
  created_at?: InputMaybe<Order_By>;
  flow_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  publisher_id?: InputMaybe<Order_By>;
  summary?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Published_Flows_Min_Fields = {
  __typename?: 'published_flows_min_fields';
  created_at?: Maybe<Scalars['timestamptz']>;
  flow_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['Int']>;
  publisher_id?: Maybe<Scalars['Int']>;
  summary?: Maybe<Scalars['String']>;
};

/** order by min() on columns of table "published_flows" */
export type Published_Flows_Min_Order_By = {
  created_at?: InputMaybe<Order_By>;
  flow_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  publisher_id?: InputMaybe<Order_By>;
  summary?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "published_flows" */
export type Published_Flows_Mutation_Response = {
  __typename?: 'published_flows_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Published_Flows>;
};

/** on_conflict condition type for table "published_flows" */
export type Published_Flows_On_Conflict = {
  constraint: Published_Flows_Constraint;
  update_columns?: Array<Published_Flows_Update_Column>;
  where?: InputMaybe<Published_Flows_Bool_Exp>;
};

/** Ordering options when selecting data from "published_flows". */
export type Published_Flows_Order_By = {
  created_at?: InputMaybe<Order_By>;
  data?: InputMaybe<Order_By>;
  flow?: InputMaybe<Flows_Order_By>;
  flow_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  publisher_id?: InputMaybe<Order_By>;
  summary?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
};

/** primary key columns input for table: published_flows */
export type Published_Flows_Pk_Columns_Input = {
  id: Scalars['Int'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Published_Flows_Prepend_Input = {
  /** Different than `flows`, published data are stored as "flattened" DAGs, meaning that the "_root" graph includes individual nodes from external portals */
  data?: InputMaybe<Scalars['jsonb']>;
};

/** select columns of table "published_flows" */
export enum Published_Flows_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Data = 'data',
  /** column name */
  FlowId = 'flow_id',
  /** column name */
  Id = 'id',
  /** column name */
  PublisherId = 'publisher_id',
  /** column name */
  Summary = 'summary'
}

/** input type for updating data in table "published_flows" */
export type Published_Flows_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']>;
  /** Different than `flows`, published data are stored as "flattened" DAGs, meaning that the "_root" graph includes individual nodes from external portals */
  data?: InputMaybe<Scalars['jsonb']>;
  flow_id?: InputMaybe<Scalars['uuid']>;
  id?: InputMaybe<Scalars['Int']>;
  publisher_id?: InputMaybe<Scalars['Int']>;
  summary?: InputMaybe<Scalars['String']>;
};

/** aggregate stddev on columns */
export type Published_Flows_Stddev_Fields = {
  __typename?: 'published_flows_stddev_fields';
  id?: Maybe<Scalars['Float']>;
  publisher_id?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "published_flows" */
export type Published_Flows_Stddev_Order_By = {
  id?: InputMaybe<Order_By>;
  publisher_id?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Published_Flows_Stddev_Pop_Fields = {
  __typename?: 'published_flows_stddev_pop_fields';
  id?: Maybe<Scalars['Float']>;
  publisher_id?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "published_flows" */
export type Published_Flows_Stddev_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  publisher_id?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Published_Flows_Stddev_Samp_Fields = {
  __typename?: 'published_flows_stddev_samp_fields';
  id?: Maybe<Scalars['Float']>;
  publisher_id?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "published_flows" */
export type Published_Flows_Stddev_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  publisher_id?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type Published_Flows_Sum_Fields = {
  __typename?: 'published_flows_sum_fields';
  id?: Maybe<Scalars['Int']>;
  publisher_id?: Maybe<Scalars['Int']>;
};

/** order by sum() on columns of table "published_flows" */
export type Published_Flows_Sum_Order_By = {
  id?: InputMaybe<Order_By>;
  publisher_id?: InputMaybe<Order_By>;
};

/** update columns of table "published_flows" */
export enum Published_Flows_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Data = 'data',
  /** column name */
  FlowId = 'flow_id',
  /** column name */
  Id = 'id',
  /** column name */
  PublisherId = 'publisher_id',
  /** column name */
  Summary = 'summary'
}

/** aggregate var_pop on columns */
export type Published_Flows_Var_Pop_Fields = {
  __typename?: 'published_flows_var_pop_fields';
  id?: Maybe<Scalars['Float']>;
  publisher_id?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "published_flows" */
export type Published_Flows_Var_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  publisher_id?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Published_Flows_Var_Samp_Fields = {
  __typename?: 'published_flows_var_samp_fields';
  id?: Maybe<Scalars['Float']>;
  publisher_id?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "published_flows" */
export type Published_Flows_Var_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  publisher_id?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Published_Flows_Variance_Fields = {
  __typename?: 'published_flows_variance_fields';
  id?: Maybe<Scalars['Float']>;
  publisher_id?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "published_flows" */
export type Published_Flows_Variance_Order_By = {
  id?: InputMaybe<Order_By>;
  publisher_id?: InputMaybe<Order_By>;
};

export type Query_Root = {
  __typename?: 'query_root';
  /** fetch data from the table: "analytics" */
  analytics: Array<Analytics>;
  /** fetch aggregated fields from the table: "analytics" */
  analytics_aggregate: Analytics_Aggregate;
  /** fetch data from the table: "analytics" using primary key columns */
  analytics_by_pk?: Maybe<Analytics>;
  /** fetch data from the table: "analytics_logs" */
  analytics_logs: Array<Analytics_Logs>;
  /** fetch aggregated fields from the table: "analytics_logs" */
  analytics_logs_aggregate: Analytics_Logs_Aggregate;
  /** fetch data from the table: "analytics_logs" using primary key columns */
  analytics_logs_by_pk?: Maybe<Analytics_Logs>;
  /** fetch data from the table: "blpu_codes" */
  blpu_codes: Array<Blpu_Codes>;
  /** fetch aggregated fields from the table: "blpu_codes" */
  blpu_codes_aggregate: Blpu_Codes_Aggregate;
  /** fetch data from the table: "blpu_codes" using primary key columns */
  blpu_codes_by_pk?: Maybe<Blpu_Codes>;
  /** fetch data from the table: "bops_applications" */
  bops_applications: Array<Bops_Applications>;
  /** fetch aggregated fields from the table: "bops_applications" */
  bops_applications_aggregate: Bops_Applications_Aggregate;
  /** fetch data from the table: "bops_applications" using primary key columns */
  bops_applications_by_pk?: Maybe<Bops_Applications>;
  /** fetch data from the table: "flow_schemas" */
  flow_schemas: Array<Flow_Schemas>;
  /** fetch aggregated fields from the table: "flow_schemas" */
  flow_schemas_aggregate: Flow_Schemas_Aggregate;
  /** fetch data from the table: "flow_schemas" using primary key columns */
  flow_schemas_by_pk?: Maybe<Flow_Schemas>;
  /** An array relationship */
  flows: Array<Flows>;
  /** An aggregate relationship */
  flows_aggregate: Flows_Aggregate;
  /** fetch data from the table: "flows" using primary key columns */
  flows_by_pk?: Maybe<Flows>;
  /** execute function "get_flow_schema" which returns "flow_schemas" */
  get_flow_schema: Array<Flow_Schemas>;
  /** execute function "get_flow_schema" and query aggregates on result of table type "flow_schemas" */
  get_flow_schema_aggregate: Flow_Schemas_Aggregate;
  /** fetch data from the table: "global_settings" */
  global_settings: Array<Global_Settings>;
  /** fetch aggregated fields from the table: "global_settings" */
  global_settings_aggregate: Global_Settings_Aggregate;
  /** fetch data from the table: "global_settings" using primary key columns */
  global_settings_by_pk?: Maybe<Global_Settings>;
  /** fetch data from the table: "lowcal_sessions" */
  lowcal_sessions: Array<Lowcal_Sessions>;
  /** fetch aggregated fields from the table: "lowcal_sessions" */
  lowcal_sessions_aggregate: Lowcal_Sessions_Aggregate;
  /** fetch data from the table: "lowcal_sessions" using primary key columns */
  lowcal_sessions_by_pk?: Maybe<Lowcal_Sessions>;
  /** An array relationship */
  operations: Array<Operations>;
  /** An aggregate relationship */
  operations_aggregate: Operations_Aggregate;
  /** fetch data from the table: "operations" using primary key columns */
  operations_by_pk?: Maybe<Operations>;
  /** fetch data from the table: "planning_constraints_requests" */
  planning_constraints_requests: Array<Planning_Constraints_Requests>;
  /** fetch aggregated fields from the table: "planning_constraints_requests" */
  planning_constraints_requests_aggregate: Planning_Constraints_Requests_Aggregate;
  /** fetch data from the table: "planning_constraints_requests" using primary key columns */
  planning_constraints_requests_by_pk?: Maybe<Planning_Constraints_Requests>;
  /** fetch data from the table: "project_types" */
  project_types: Array<Project_Types>;
  /** fetch aggregated fields from the table: "project_types" */
  project_types_aggregate: Project_Types_Aggregate;
  /** fetch data from the table: "project_types" using primary key columns */
  project_types_by_pk?: Maybe<Project_Types>;
  /** An array relationship */
  published_flows: Array<Published_Flows>;
  /** An aggregate relationship */
  published_flows_aggregate: Published_Flows_Aggregate;
  /** fetch data from the table: "published_flows" using primary key columns */
  published_flows_by_pk?: Maybe<Published_Flows>;
  /** fetch data from the table: "reconciliation_requests" */
  reconciliation_requests: Array<Reconciliation_Requests>;
  /** fetch aggregated fields from the table: "reconciliation_requests" */
  reconciliation_requests_aggregate: Reconciliation_Requests_Aggregate;
  /** fetch data from the table: "reconciliation_requests" using primary key columns */
  reconciliation_requests_by_pk?: Maybe<Reconciliation_Requests>;
  /** An array relationship */
  session_backups: Array<Session_Backups>;
  /** An aggregate relationship */
  session_backups_aggregate: Session_Backups_Aggregate;
  /** fetch data from the table: "session_backups" using primary key columns */
  session_backups_by_pk?: Maybe<Session_Backups>;
  /** An array relationship */
  team_members: Array<Team_Members>;
  /** An aggregate relationship */
  team_members_aggregate: Team_Members_Aggregate;
  /** fetch data from the table: "team_members" using primary key columns */
  team_members_by_pk?: Maybe<Team_Members>;
  /** fetch data from the table: "teams" */
  teams: Array<Teams>;
  /** fetch aggregated fields from the table: "teams" */
  teams_aggregate: Teams_Aggregate;
  /** fetch data from the table: "teams" using primary key columns */
  teams_by_pk?: Maybe<Teams>;
  /** fetch data from the table: "uniform_applications" */
  uniform_applications: Array<Uniform_Applications>;
  /** fetch aggregated fields from the table: "uniform_applications" */
  uniform_applications_aggregate: Uniform_Applications_Aggregate;
  /** fetch data from the table: "uniform_applications" using primary key columns */
  uniform_applications_by_pk?: Maybe<Uniform_Applications>;
  /** fetch data from the table: "users" */
  users: Array<Users>;
  /** fetch aggregated fields from the table: "users" */
  users_aggregate: Users_Aggregate;
  /** fetch data from the table: "users" using primary key columns */
  users_by_pk?: Maybe<Users>;
};


export type Query_RootAnalyticsArgs = {
  distinct_on?: InputMaybe<Array<Analytics_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Analytics_Order_By>>;
  where?: InputMaybe<Analytics_Bool_Exp>;
};


export type Query_RootAnalytics_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Analytics_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Analytics_Order_By>>;
  where?: InputMaybe<Analytics_Bool_Exp>;
};


export type Query_RootAnalytics_By_PkArgs = {
  id: Scalars['bigint'];
};


export type Query_RootAnalytics_LogsArgs = {
  distinct_on?: InputMaybe<Array<Analytics_Logs_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Analytics_Logs_Order_By>>;
  where?: InputMaybe<Analytics_Logs_Bool_Exp>;
};


export type Query_RootAnalytics_Logs_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Analytics_Logs_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Analytics_Logs_Order_By>>;
  where?: InputMaybe<Analytics_Logs_Bool_Exp>;
};


export type Query_RootAnalytics_Logs_By_PkArgs = {
  id: Scalars['bigint'];
};


export type Query_RootBlpu_CodesArgs = {
  distinct_on?: InputMaybe<Array<Blpu_Codes_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Blpu_Codes_Order_By>>;
  where?: InputMaybe<Blpu_Codes_Bool_Exp>;
};


export type Query_RootBlpu_Codes_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Blpu_Codes_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Blpu_Codes_Order_By>>;
  where?: InputMaybe<Blpu_Codes_Bool_Exp>;
};


export type Query_RootBlpu_Codes_By_PkArgs = {
  code: Scalars['String'];
};


export type Query_RootBops_ApplicationsArgs = {
  distinct_on?: InputMaybe<Array<Bops_Applications_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Bops_Applications_Order_By>>;
  where?: InputMaybe<Bops_Applications_Bool_Exp>;
};


export type Query_RootBops_Applications_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Bops_Applications_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Bops_Applications_Order_By>>;
  where?: InputMaybe<Bops_Applications_Bool_Exp>;
};


export type Query_RootBops_Applications_By_PkArgs = {
  id: Scalars['Int'];
};


export type Query_RootFlow_SchemasArgs = {
  distinct_on?: InputMaybe<Array<Flow_Schemas_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flow_Schemas_Order_By>>;
  where?: InputMaybe<Flow_Schemas_Bool_Exp>;
};


export type Query_RootFlow_Schemas_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flow_Schemas_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flow_Schemas_Order_By>>;
  where?: InputMaybe<Flow_Schemas_Bool_Exp>;
};


export type Query_RootFlow_Schemas_By_PkArgs = {
  flow_id: Scalars['uuid'];
  node: Scalars['String'];
};


export type Query_RootFlowsArgs = {
  distinct_on?: InputMaybe<Array<Flows_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flows_Order_By>>;
  where?: InputMaybe<Flows_Bool_Exp>;
};


export type Query_RootFlows_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flows_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flows_Order_By>>;
  where?: InputMaybe<Flows_Bool_Exp>;
};


export type Query_RootFlows_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Query_RootGet_Flow_SchemaArgs = {
  args: Get_Flow_Schema_Args;
  distinct_on?: InputMaybe<Array<Flow_Schemas_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flow_Schemas_Order_By>>;
  where?: InputMaybe<Flow_Schemas_Bool_Exp>;
};


export type Query_RootGet_Flow_Schema_AggregateArgs = {
  args: Get_Flow_Schema_Args;
  distinct_on?: InputMaybe<Array<Flow_Schemas_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flow_Schemas_Order_By>>;
  where?: InputMaybe<Flow_Schemas_Bool_Exp>;
};


export type Query_RootGlobal_SettingsArgs = {
  distinct_on?: InputMaybe<Array<Global_Settings_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Global_Settings_Order_By>>;
  where?: InputMaybe<Global_Settings_Bool_Exp>;
};


export type Query_RootGlobal_Settings_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Global_Settings_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Global_Settings_Order_By>>;
  where?: InputMaybe<Global_Settings_Bool_Exp>;
};


export type Query_RootGlobal_Settings_By_PkArgs = {
  id: Scalars['Int'];
};


export type Query_RootLowcal_SessionsArgs = {
  distinct_on?: InputMaybe<Array<Lowcal_Sessions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Lowcal_Sessions_Order_By>>;
  where?: InputMaybe<Lowcal_Sessions_Bool_Exp>;
};


export type Query_RootLowcal_Sessions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Lowcal_Sessions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Lowcal_Sessions_Order_By>>;
  where?: InputMaybe<Lowcal_Sessions_Bool_Exp>;
};


export type Query_RootLowcal_Sessions_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Query_RootOperationsArgs = {
  distinct_on?: InputMaybe<Array<Operations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Operations_Order_By>>;
  where?: InputMaybe<Operations_Bool_Exp>;
};


export type Query_RootOperations_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Operations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Operations_Order_By>>;
  where?: InputMaybe<Operations_Bool_Exp>;
};


export type Query_RootOperations_By_PkArgs = {
  id: Scalars['bigint'];
};


export type Query_RootPlanning_Constraints_RequestsArgs = {
  distinct_on?: InputMaybe<Array<Planning_Constraints_Requests_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Planning_Constraints_Requests_Order_By>>;
  where?: InputMaybe<Planning_Constraints_Requests_Bool_Exp>;
};


export type Query_RootPlanning_Constraints_Requests_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Planning_Constraints_Requests_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Planning_Constraints_Requests_Order_By>>;
  where?: InputMaybe<Planning_Constraints_Requests_Bool_Exp>;
};


export type Query_RootPlanning_Constraints_Requests_By_PkArgs = {
  id: Scalars['Int'];
};


export type Query_RootProject_TypesArgs = {
  distinct_on?: InputMaybe<Array<Project_Types_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Project_Types_Order_By>>;
  where?: InputMaybe<Project_Types_Bool_Exp>;
};


export type Query_RootProject_Types_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Project_Types_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Project_Types_Order_By>>;
  where?: InputMaybe<Project_Types_Bool_Exp>;
};


export type Query_RootProject_Types_By_PkArgs = {
  id: Scalars['Int'];
};


export type Query_RootPublished_FlowsArgs = {
  distinct_on?: InputMaybe<Array<Published_Flows_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Published_Flows_Order_By>>;
  where?: InputMaybe<Published_Flows_Bool_Exp>;
};


export type Query_RootPublished_Flows_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Published_Flows_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Published_Flows_Order_By>>;
  where?: InputMaybe<Published_Flows_Bool_Exp>;
};


export type Query_RootPublished_Flows_By_PkArgs = {
  id: Scalars['Int'];
};


export type Query_RootReconciliation_RequestsArgs = {
  distinct_on?: InputMaybe<Array<Reconciliation_Requests_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Reconciliation_Requests_Order_By>>;
  where?: InputMaybe<Reconciliation_Requests_Bool_Exp>;
};


export type Query_RootReconciliation_Requests_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Reconciliation_Requests_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Reconciliation_Requests_Order_By>>;
  where?: InputMaybe<Reconciliation_Requests_Bool_Exp>;
};


export type Query_RootReconciliation_Requests_By_PkArgs = {
  id: Scalars['Int'];
};


export type Query_RootSession_BackupsArgs = {
  distinct_on?: InputMaybe<Array<Session_Backups_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Session_Backups_Order_By>>;
  where?: InputMaybe<Session_Backups_Bool_Exp>;
};


export type Query_RootSession_Backups_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Session_Backups_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Session_Backups_Order_By>>;
  where?: InputMaybe<Session_Backups_Bool_Exp>;
};


export type Query_RootSession_Backups_By_PkArgs = {
  id: Scalars['Int'];
};


export type Query_RootTeam_MembersArgs = {
  distinct_on?: InputMaybe<Array<Team_Members_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Team_Members_Order_By>>;
  where?: InputMaybe<Team_Members_Bool_Exp>;
};


export type Query_RootTeam_Members_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Team_Members_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Team_Members_Order_By>>;
  where?: InputMaybe<Team_Members_Bool_Exp>;
};


export type Query_RootTeam_Members_By_PkArgs = {
  team_id: Scalars['Int'];
  user_id: Scalars['Int'];
};


export type Query_RootTeamsArgs = {
  distinct_on?: InputMaybe<Array<Teams_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Teams_Order_By>>;
  where?: InputMaybe<Teams_Bool_Exp>;
};


export type Query_RootTeams_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Teams_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Teams_Order_By>>;
  where?: InputMaybe<Teams_Bool_Exp>;
};


export type Query_RootTeams_By_PkArgs = {
  id: Scalars['Int'];
};


export type Query_RootUniform_ApplicationsArgs = {
  distinct_on?: InputMaybe<Array<Uniform_Applications_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Uniform_Applications_Order_By>>;
  where?: InputMaybe<Uniform_Applications_Bool_Exp>;
};


export type Query_RootUniform_Applications_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Uniform_Applications_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Uniform_Applications_Order_By>>;
  where?: InputMaybe<Uniform_Applications_Bool_Exp>;
};


export type Query_RootUniform_Applications_By_PkArgs = {
  id: Scalars['Int'];
};


export type Query_RootUsersArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Query_RootUsers_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Query_RootUsers_By_PkArgs = {
  id: Scalars['Int'];
};

/** Audit log of reconcilied session data for successfully resumed lowcal_sessions */
export type Reconciliation_Requests = {
  __typename?: 'reconciliation_requests';
  created_at: Scalars['timestamptz'];
  id: Scalars['Int'];
  message?: Maybe<Scalars['String']>;
  response?: Maybe<Scalars['jsonb']>;
  session_id?: Maybe<Scalars['String']>;
};


/** Audit log of reconcilied session data for successfully resumed lowcal_sessions */
export type Reconciliation_RequestsResponseArgs = {
  path?: InputMaybe<Scalars['String']>;
};

/** aggregated selection of "reconciliation_requests" */
export type Reconciliation_Requests_Aggregate = {
  __typename?: 'reconciliation_requests_aggregate';
  aggregate?: Maybe<Reconciliation_Requests_Aggregate_Fields>;
  nodes: Array<Reconciliation_Requests>;
};

/** aggregate fields of "reconciliation_requests" */
export type Reconciliation_Requests_Aggregate_Fields = {
  __typename?: 'reconciliation_requests_aggregate_fields';
  avg?: Maybe<Reconciliation_Requests_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<Reconciliation_Requests_Max_Fields>;
  min?: Maybe<Reconciliation_Requests_Min_Fields>;
  stddev?: Maybe<Reconciliation_Requests_Stddev_Fields>;
  stddev_pop?: Maybe<Reconciliation_Requests_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Reconciliation_Requests_Stddev_Samp_Fields>;
  sum?: Maybe<Reconciliation_Requests_Sum_Fields>;
  var_pop?: Maybe<Reconciliation_Requests_Var_Pop_Fields>;
  var_samp?: Maybe<Reconciliation_Requests_Var_Samp_Fields>;
  variance?: Maybe<Reconciliation_Requests_Variance_Fields>;
};


/** aggregate fields of "reconciliation_requests" */
export type Reconciliation_Requests_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Reconciliation_Requests_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Reconciliation_Requests_Append_Input = {
  response?: InputMaybe<Scalars['jsonb']>;
};

/** aggregate avg on columns */
export type Reconciliation_Requests_Avg_Fields = {
  __typename?: 'reconciliation_requests_avg_fields';
  id?: Maybe<Scalars['Float']>;
};

/** Boolean expression to filter rows from the table "reconciliation_requests". All fields are combined with a logical 'AND'. */
export type Reconciliation_Requests_Bool_Exp = {
  _and?: InputMaybe<Array<Reconciliation_Requests_Bool_Exp>>;
  _not?: InputMaybe<Reconciliation_Requests_Bool_Exp>;
  _or?: InputMaybe<Array<Reconciliation_Requests_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  message?: InputMaybe<String_Comparison_Exp>;
  response?: InputMaybe<Jsonb_Comparison_Exp>;
  session_id?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "reconciliation_requests" */
export enum Reconciliation_Requests_Constraint {
  /** unique or primary key constraint on columns "id" */
  ReconciliationRequestsPkey = 'reconciliation_requests_pkey'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Reconciliation_Requests_Delete_At_Path_Input = {
  response?: InputMaybe<Array<Scalars['String']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Reconciliation_Requests_Delete_Elem_Input = {
  response?: InputMaybe<Scalars['Int']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Reconciliation_Requests_Delete_Key_Input = {
  response?: InputMaybe<Scalars['String']>;
};

/** input type for incrementing numeric columns in table "reconciliation_requests" */
export type Reconciliation_Requests_Inc_Input = {
  id?: InputMaybe<Scalars['Int']>;
};

/** input type for inserting data into table "reconciliation_requests" */
export type Reconciliation_Requests_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']>;
  id?: InputMaybe<Scalars['Int']>;
  message?: InputMaybe<Scalars['String']>;
  response?: InputMaybe<Scalars['jsonb']>;
  session_id?: InputMaybe<Scalars['String']>;
};

/** aggregate max on columns */
export type Reconciliation_Requests_Max_Fields = {
  __typename?: 'reconciliation_requests_max_fields';
  created_at?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['Int']>;
  message?: Maybe<Scalars['String']>;
  session_id?: Maybe<Scalars['String']>;
};

/** aggregate min on columns */
export type Reconciliation_Requests_Min_Fields = {
  __typename?: 'reconciliation_requests_min_fields';
  created_at?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['Int']>;
  message?: Maybe<Scalars['String']>;
  session_id?: Maybe<Scalars['String']>;
};

/** response of any mutation on the table "reconciliation_requests" */
export type Reconciliation_Requests_Mutation_Response = {
  __typename?: 'reconciliation_requests_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Reconciliation_Requests>;
};

/** on_conflict condition type for table "reconciliation_requests" */
export type Reconciliation_Requests_On_Conflict = {
  constraint: Reconciliation_Requests_Constraint;
  update_columns?: Array<Reconciliation_Requests_Update_Column>;
  where?: InputMaybe<Reconciliation_Requests_Bool_Exp>;
};

/** Ordering options when selecting data from "reconciliation_requests". */
export type Reconciliation_Requests_Order_By = {
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  message?: InputMaybe<Order_By>;
  response?: InputMaybe<Order_By>;
  session_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: reconciliation_requests */
export type Reconciliation_Requests_Pk_Columns_Input = {
  id: Scalars['Int'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Reconciliation_Requests_Prepend_Input = {
  response?: InputMaybe<Scalars['jsonb']>;
};

/** select columns of table "reconciliation_requests" */
export enum Reconciliation_Requests_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  Message = 'message',
  /** column name */
  Response = 'response',
  /** column name */
  SessionId = 'session_id'
}

/** input type for updating data in table "reconciliation_requests" */
export type Reconciliation_Requests_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']>;
  id?: InputMaybe<Scalars['Int']>;
  message?: InputMaybe<Scalars['String']>;
  response?: InputMaybe<Scalars['jsonb']>;
  session_id?: InputMaybe<Scalars['String']>;
};

/** aggregate stddev on columns */
export type Reconciliation_Requests_Stddev_Fields = {
  __typename?: 'reconciliation_requests_stddev_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_pop on columns */
export type Reconciliation_Requests_Stddev_Pop_Fields = {
  __typename?: 'reconciliation_requests_stddev_pop_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_samp on columns */
export type Reconciliation_Requests_Stddev_Samp_Fields = {
  __typename?: 'reconciliation_requests_stddev_samp_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate sum on columns */
export type Reconciliation_Requests_Sum_Fields = {
  __typename?: 'reconciliation_requests_sum_fields';
  id?: Maybe<Scalars['Int']>;
};

/** update columns of table "reconciliation_requests" */
export enum Reconciliation_Requests_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  Message = 'message',
  /** column name */
  Response = 'response',
  /** column name */
  SessionId = 'session_id'
}

/** aggregate var_pop on columns */
export type Reconciliation_Requests_Var_Pop_Fields = {
  __typename?: 'reconciliation_requests_var_pop_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate var_samp on columns */
export type Reconciliation_Requests_Var_Samp_Fields = {
  __typename?: 'reconciliation_requests_var_samp_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate variance on columns */
export type Reconciliation_Requests_Variance_Fields = {
  __typename?: 'reconciliation_requests_variance_fields';
  id?: Maybe<Scalars['Float']>;
};

/** stores session data as a backup before taking payment */
export type Session_Backups = {
  __typename?: 'session_backups';
  created_at: Scalars['timestamptz'];
  /** An object relationship */
  flow?: Maybe<Flows>;
  flow_data?: Maybe<Scalars['jsonb']>;
  flow_id?: Maybe<Scalars['uuid']>;
  id: Scalars['Int'];
  session_id?: Maybe<Scalars['uuid']>;
  /** includes passport and breadcrumb data */
  user_data?: Maybe<Scalars['jsonb']>;
};


/** stores session data as a backup before taking payment */
export type Session_BackupsFlow_DataArgs = {
  path?: InputMaybe<Scalars['String']>;
};


/** stores session data as a backup before taking payment */
export type Session_BackupsUser_DataArgs = {
  path?: InputMaybe<Scalars['String']>;
};

/** aggregated selection of "session_backups" */
export type Session_Backups_Aggregate = {
  __typename?: 'session_backups_aggregate';
  aggregate?: Maybe<Session_Backups_Aggregate_Fields>;
  nodes: Array<Session_Backups>;
};

/** aggregate fields of "session_backups" */
export type Session_Backups_Aggregate_Fields = {
  __typename?: 'session_backups_aggregate_fields';
  avg?: Maybe<Session_Backups_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<Session_Backups_Max_Fields>;
  min?: Maybe<Session_Backups_Min_Fields>;
  stddev?: Maybe<Session_Backups_Stddev_Fields>;
  stddev_pop?: Maybe<Session_Backups_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Session_Backups_Stddev_Samp_Fields>;
  sum?: Maybe<Session_Backups_Sum_Fields>;
  var_pop?: Maybe<Session_Backups_Var_Pop_Fields>;
  var_samp?: Maybe<Session_Backups_Var_Samp_Fields>;
  variance?: Maybe<Session_Backups_Variance_Fields>;
};


/** aggregate fields of "session_backups" */
export type Session_Backups_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Session_Backups_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "session_backups" */
export type Session_Backups_Aggregate_Order_By = {
  avg?: InputMaybe<Session_Backups_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Session_Backups_Max_Order_By>;
  min?: InputMaybe<Session_Backups_Min_Order_By>;
  stddev?: InputMaybe<Session_Backups_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Session_Backups_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Session_Backups_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Session_Backups_Sum_Order_By>;
  var_pop?: InputMaybe<Session_Backups_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Session_Backups_Var_Samp_Order_By>;
  variance?: InputMaybe<Session_Backups_Variance_Order_By>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Session_Backups_Append_Input = {
  flow_data?: InputMaybe<Scalars['jsonb']>;
  /** includes passport and breadcrumb data */
  user_data?: InputMaybe<Scalars['jsonb']>;
};

/** input type for inserting array relation for remote table "session_backups" */
export type Session_Backups_Arr_Rel_Insert_Input = {
  data: Array<Session_Backups_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Session_Backups_On_Conflict>;
};

/** aggregate avg on columns */
export type Session_Backups_Avg_Fields = {
  __typename?: 'session_backups_avg_fields';
  id?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "session_backups" */
export type Session_Backups_Avg_Order_By = {
  id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "session_backups". All fields are combined with a logical 'AND'. */
export type Session_Backups_Bool_Exp = {
  _and?: InputMaybe<Array<Session_Backups_Bool_Exp>>;
  _not?: InputMaybe<Session_Backups_Bool_Exp>;
  _or?: InputMaybe<Array<Session_Backups_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  flow?: InputMaybe<Flows_Bool_Exp>;
  flow_data?: InputMaybe<Jsonb_Comparison_Exp>;
  flow_id?: InputMaybe<Uuid_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  session_id?: InputMaybe<Uuid_Comparison_Exp>;
  user_data?: InputMaybe<Jsonb_Comparison_Exp>;
};

/** unique or primary key constraints on table "session_backups" */
export enum Session_Backups_Constraint {
  /** unique or primary key constraint on columns "id" */
  SessionBackupsPkey = 'session_backups_pkey'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Session_Backups_Delete_At_Path_Input = {
  flow_data?: InputMaybe<Array<Scalars['String']>>;
  /** includes passport and breadcrumb data */
  user_data?: InputMaybe<Array<Scalars['String']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Session_Backups_Delete_Elem_Input = {
  flow_data?: InputMaybe<Scalars['Int']>;
  /** includes passport and breadcrumb data */
  user_data?: InputMaybe<Scalars['Int']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Session_Backups_Delete_Key_Input = {
  flow_data?: InputMaybe<Scalars['String']>;
  /** includes passport and breadcrumb data */
  user_data?: InputMaybe<Scalars['String']>;
};

/** input type for incrementing numeric columns in table "session_backups" */
export type Session_Backups_Inc_Input = {
  id?: InputMaybe<Scalars['Int']>;
};

/** input type for inserting data into table "session_backups" */
export type Session_Backups_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']>;
  flow?: InputMaybe<Flows_Obj_Rel_Insert_Input>;
  flow_data?: InputMaybe<Scalars['jsonb']>;
  flow_id?: InputMaybe<Scalars['uuid']>;
  id?: InputMaybe<Scalars['Int']>;
  session_id?: InputMaybe<Scalars['uuid']>;
  /** includes passport and breadcrumb data */
  user_data?: InputMaybe<Scalars['jsonb']>;
};

/** aggregate max on columns */
export type Session_Backups_Max_Fields = {
  __typename?: 'session_backups_max_fields';
  created_at?: Maybe<Scalars['timestamptz']>;
  flow_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['Int']>;
  session_id?: Maybe<Scalars['uuid']>;
};

/** order by max() on columns of table "session_backups" */
export type Session_Backups_Max_Order_By = {
  created_at?: InputMaybe<Order_By>;
  flow_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  session_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Session_Backups_Min_Fields = {
  __typename?: 'session_backups_min_fields';
  created_at?: Maybe<Scalars['timestamptz']>;
  flow_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['Int']>;
  session_id?: Maybe<Scalars['uuid']>;
};

/** order by min() on columns of table "session_backups" */
export type Session_Backups_Min_Order_By = {
  created_at?: InputMaybe<Order_By>;
  flow_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  session_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "session_backups" */
export type Session_Backups_Mutation_Response = {
  __typename?: 'session_backups_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Session_Backups>;
};

/** on_conflict condition type for table "session_backups" */
export type Session_Backups_On_Conflict = {
  constraint: Session_Backups_Constraint;
  update_columns?: Array<Session_Backups_Update_Column>;
  where?: InputMaybe<Session_Backups_Bool_Exp>;
};

/** Ordering options when selecting data from "session_backups". */
export type Session_Backups_Order_By = {
  created_at?: InputMaybe<Order_By>;
  flow?: InputMaybe<Flows_Order_By>;
  flow_data?: InputMaybe<Order_By>;
  flow_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  session_id?: InputMaybe<Order_By>;
  user_data?: InputMaybe<Order_By>;
};

/** primary key columns input for table: session_backups */
export type Session_Backups_Pk_Columns_Input = {
  id: Scalars['Int'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Session_Backups_Prepend_Input = {
  flow_data?: InputMaybe<Scalars['jsonb']>;
  /** includes passport and breadcrumb data */
  user_data?: InputMaybe<Scalars['jsonb']>;
};

/** select columns of table "session_backups" */
export enum Session_Backups_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  FlowData = 'flow_data',
  /** column name */
  FlowId = 'flow_id',
  /** column name */
  Id = 'id',
  /** column name */
  SessionId = 'session_id',
  /** column name */
  UserData = 'user_data'
}

/** input type for updating data in table "session_backups" */
export type Session_Backups_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']>;
  flow_data?: InputMaybe<Scalars['jsonb']>;
  flow_id?: InputMaybe<Scalars['uuid']>;
  id?: InputMaybe<Scalars['Int']>;
  session_id?: InputMaybe<Scalars['uuid']>;
  /** includes passport and breadcrumb data */
  user_data?: InputMaybe<Scalars['jsonb']>;
};

/** aggregate stddev on columns */
export type Session_Backups_Stddev_Fields = {
  __typename?: 'session_backups_stddev_fields';
  id?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "session_backups" */
export type Session_Backups_Stddev_Order_By = {
  id?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Session_Backups_Stddev_Pop_Fields = {
  __typename?: 'session_backups_stddev_pop_fields';
  id?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "session_backups" */
export type Session_Backups_Stddev_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Session_Backups_Stddev_Samp_Fields = {
  __typename?: 'session_backups_stddev_samp_fields';
  id?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "session_backups" */
export type Session_Backups_Stddev_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type Session_Backups_Sum_Fields = {
  __typename?: 'session_backups_sum_fields';
  id?: Maybe<Scalars['Int']>;
};

/** order by sum() on columns of table "session_backups" */
export type Session_Backups_Sum_Order_By = {
  id?: InputMaybe<Order_By>;
};

/** update columns of table "session_backups" */
export enum Session_Backups_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  FlowData = 'flow_data',
  /** column name */
  FlowId = 'flow_id',
  /** column name */
  Id = 'id',
  /** column name */
  SessionId = 'session_id',
  /** column name */
  UserData = 'user_data'
}

/** aggregate var_pop on columns */
export type Session_Backups_Var_Pop_Fields = {
  __typename?: 'session_backups_var_pop_fields';
  id?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "session_backups" */
export type Session_Backups_Var_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Session_Backups_Var_Samp_Fields = {
  __typename?: 'session_backups_var_samp_fields';
  id?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "session_backups" */
export type Session_Backups_Var_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Session_Backups_Variance_Fields = {
  __typename?: 'session_backups_variance_fields';
  id?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "session_backups" */
export type Session_Backups_Variance_Order_By = {
  id?: InputMaybe<Order_By>;
};

export type Subscription_Root = {
  __typename?: 'subscription_root';
  /** fetch data from the table: "analytics" */
  analytics: Array<Analytics>;
  /** fetch aggregated fields from the table: "analytics" */
  analytics_aggregate: Analytics_Aggregate;
  /** fetch data from the table: "analytics" using primary key columns */
  analytics_by_pk?: Maybe<Analytics>;
  /** fetch data from the table: "analytics_logs" */
  analytics_logs: Array<Analytics_Logs>;
  /** fetch aggregated fields from the table: "analytics_logs" */
  analytics_logs_aggregate: Analytics_Logs_Aggregate;
  /** fetch data from the table: "analytics_logs" using primary key columns */
  analytics_logs_by_pk?: Maybe<Analytics_Logs>;
  /** fetch data from the table: "blpu_codes" */
  blpu_codes: Array<Blpu_Codes>;
  /** fetch aggregated fields from the table: "blpu_codes" */
  blpu_codes_aggregate: Blpu_Codes_Aggregate;
  /** fetch data from the table: "blpu_codes" using primary key columns */
  blpu_codes_by_pk?: Maybe<Blpu_Codes>;
  /** fetch data from the table: "bops_applications" */
  bops_applications: Array<Bops_Applications>;
  /** fetch aggregated fields from the table: "bops_applications" */
  bops_applications_aggregate: Bops_Applications_Aggregate;
  /** fetch data from the table: "bops_applications" using primary key columns */
  bops_applications_by_pk?: Maybe<Bops_Applications>;
  /** fetch data from the table: "flow_schemas" */
  flow_schemas: Array<Flow_Schemas>;
  /** fetch aggregated fields from the table: "flow_schemas" */
  flow_schemas_aggregate: Flow_Schemas_Aggregate;
  /** fetch data from the table: "flow_schemas" using primary key columns */
  flow_schemas_by_pk?: Maybe<Flow_Schemas>;
  /** An array relationship */
  flows: Array<Flows>;
  /** An aggregate relationship */
  flows_aggregate: Flows_Aggregate;
  /** fetch data from the table: "flows" using primary key columns */
  flows_by_pk?: Maybe<Flows>;
  /** execute function "get_flow_schema" which returns "flow_schemas" */
  get_flow_schema: Array<Flow_Schemas>;
  /** execute function "get_flow_schema" and query aggregates on result of table type "flow_schemas" */
  get_flow_schema_aggregate: Flow_Schemas_Aggregate;
  /** fetch data from the table: "global_settings" */
  global_settings: Array<Global_Settings>;
  /** fetch aggregated fields from the table: "global_settings" */
  global_settings_aggregate: Global_Settings_Aggregate;
  /** fetch data from the table: "global_settings" using primary key columns */
  global_settings_by_pk?: Maybe<Global_Settings>;
  /** fetch data from the table: "lowcal_sessions" */
  lowcal_sessions: Array<Lowcal_Sessions>;
  /** fetch aggregated fields from the table: "lowcal_sessions" */
  lowcal_sessions_aggregate: Lowcal_Sessions_Aggregate;
  /** fetch data from the table: "lowcal_sessions" using primary key columns */
  lowcal_sessions_by_pk?: Maybe<Lowcal_Sessions>;
  /** An array relationship */
  operations: Array<Operations>;
  /** An aggregate relationship */
  operations_aggregate: Operations_Aggregate;
  /** fetch data from the table: "operations" using primary key columns */
  operations_by_pk?: Maybe<Operations>;
  /** fetch data from the table: "planning_constraints_requests" */
  planning_constraints_requests: Array<Planning_Constraints_Requests>;
  /** fetch aggregated fields from the table: "planning_constraints_requests" */
  planning_constraints_requests_aggregate: Planning_Constraints_Requests_Aggregate;
  /** fetch data from the table: "planning_constraints_requests" using primary key columns */
  planning_constraints_requests_by_pk?: Maybe<Planning_Constraints_Requests>;
  /** fetch data from the table: "project_types" */
  project_types: Array<Project_Types>;
  /** fetch aggregated fields from the table: "project_types" */
  project_types_aggregate: Project_Types_Aggregate;
  /** fetch data from the table: "project_types" using primary key columns */
  project_types_by_pk?: Maybe<Project_Types>;
  /** An array relationship */
  published_flows: Array<Published_Flows>;
  /** An aggregate relationship */
  published_flows_aggregate: Published_Flows_Aggregate;
  /** fetch data from the table: "published_flows" using primary key columns */
  published_flows_by_pk?: Maybe<Published_Flows>;
  /** fetch data from the table: "reconciliation_requests" */
  reconciliation_requests: Array<Reconciliation_Requests>;
  /** fetch aggregated fields from the table: "reconciliation_requests" */
  reconciliation_requests_aggregate: Reconciliation_Requests_Aggregate;
  /** fetch data from the table: "reconciliation_requests" using primary key columns */
  reconciliation_requests_by_pk?: Maybe<Reconciliation_Requests>;
  /** An array relationship */
  session_backups: Array<Session_Backups>;
  /** An aggregate relationship */
  session_backups_aggregate: Session_Backups_Aggregate;
  /** fetch data from the table: "session_backups" using primary key columns */
  session_backups_by_pk?: Maybe<Session_Backups>;
  /** An array relationship */
  team_members: Array<Team_Members>;
  /** An aggregate relationship */
  team_members_aggregate: Team_Members_Aggregate;
  /** fetch data from the table: "team_members" using primary key columns */
  team_members_by_pk?: Maybe<Team_Members>;
  /** fetch data from the table: "teams" */
  teams: Array<Teams>;
  /** fetch aggregated fields from the table: "teams" */
  teams_aggregate: Teams_Aggregate;
  /** fetch data from the table: "teams" using primary key columns */
  teams_by_pk?: Maybe<Teams>;
  /** fetch data from the table: "uniform_applications" */
  uniform_applications: Array<Uniform_Applications>;
  /** fetch aggregated fields from the table: "uniform_applications" */
  uniform_applications_aggregate: Uniform_Applications_Aggregate;
  /** fetch data from the table: "uniform_applications" using primary key columns */
  uniform_applications_by_pk?: Maybe<Uniform_Applications>;
  /** fetch data from the table: "users" */
  users: Array<Users>;
  /** fetch aggregated fields from the table: "users" */
  users_aggregate: Users_Aggregate;
  /** fetch data from the table: "users" using primary key columns */
  users_by_pk?: Maybe<Users>;
};


export type Subscription_RootAnalyticsArgs = {
  distinct_on?: InputMaybe<Array<Analytics_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Analytics_Order_By>>;
  where?: InputMaybe<Analytics_Bool_Exp>;
};


export type Subscription_RootAnalytics_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Analytics_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Analytics_Order_By>>;
  where?: InputMaybe<Analytics_Bool_Exp>;
};


export type Subscription_RootAnalytics_By_PkArgs = {
  id: Scalars['bigint'];
};


export type Subscription_RootAnalytics_LogsArgs = {
  distinct_on?: InputMaybe<Array<Analytics_Logs_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Analytics_Logs_Order_By>>;
  where?: InputMaybe<Analytics_Logs_Bool_Exp>;
};


export type Subscription_RootAnalytics_Logs_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Analytics_Logs_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Analytics_Logs_Order_By>>;
  where?: InputMaybe<Analytics_Logs_Bool_Exp>;
};


export type Subscription_RootAnalytics_Logs_By_PkArgs = {
  id: Scalars['bigint'];
};


export type Subscription_RootBlpu_CodesArgs = {
  distinct_on?: InputMaybe<Array<Blpu_Codes_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Blpu_Codes_Order_By>>;
  where?: InputMaybe<Blpu_Codes_Bool_Exp>;
};


export type Subscription_RootBlpu_Codes_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Blpu_Codes_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Blpu_Codes_Order_By>>;
  where?: InputMaybe<Blpu_Codes_Bool_Exp>;
};


export type Subscription_RootBlpu_Codes_By_PkArgs = {
  code: Scalars['String'];
};


export type Subscription_RootBops_ApplicationsArgs = {
  distinct_on?: InputMaybe<Array<Bops_Applications_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Bops_Applications_Order_By>>;
  where?: InputMaybe<Bops_Applications_Bool_Exp>;
};


export type Subscription_RootBops_Applications_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Bops_Applications_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Bops_Applications_Order_By>>;
  where?: InputMaybe<Bops_Applications_Bool_Exp>;
};


export type Subscription_RootBops_Applications_By_PkArgs = {
  id: Scalars['Int'];
};


export type Subscription_RootFlow_SchemasArgs = {
  distinct_on?: InputMaybe<Array<Flow_Schemas_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flow_Schemas_Order_By>>;
  where?: InputMaybe<Flow_Schemas_Bool_Exp>;
};


export type Subscription_RootFlow_Schemas_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flow_Schemas_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flow_Schemas_Order_By>>;
  where?: InputMaybe<Flow_Schemas_Bool_Exp>;
};


export type Subscription_RootFlow_Schemas_By_PkArgs = {
  flow_id: Scalars['uuid'];
  node: Scalars['String'];
};


export type Subscription_RootFlowsArgs = {
  distinct_on?: InputMaybe<Array<Flows_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flows_Order_By>>;
  where?: InputMaybe<Flows_Bool_Exp>;
};


export type Subscription_RootFlows_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flows_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flows_Order_By>>;
  where?: InputMaybe<Flows_Bool_Exp>;
};


export type Subscription_RootFlows_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Subscription_RootGet_Flow_SchemaArgs = {
  args: Get_Flow_Schema_Args;
  distinct_on?: InputMaybe<Array<Flow_Schemas_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flow_Schemas_Order_By>>;
  where?: InputMaybe<Flow_Schemas_Bool_Exp>;
};


export type Subscription_RootGet_Flow_Schema_AggregateArgs = {
  args: Get_Flow_Schema_Args;
  distinct_on?: InputMaybe<Array<Flow_Schemas_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flow_Schemas_Order_By>>;
  where?: InputMaybe<Flow_Schemas_Bool_Exp>;
};


export type Subscription_RootGlobal_SettingsArgs = {
  distinct_on?: InputMaybe<Array<Global_Settings_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Global_Settings_Order_By>>;
  where?: InputMaybe<Global_Settings_Bool_Exp>;
};


export type Subscription_RootGlobal_Settings_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Global_Settings_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Global_Settings_Order_By>>;
  where?: InputMaybe<Global_Settings_Bool_Exp>;
};


export type Subscription_RootGlobal_Settings_By_PkArgs = {
  id: Scalars['Int'];
};


export type Subscription_RootLowcal_SessionsArgs = {
  distinct_on?: InputMaybe<Array<Lowcal_Sessions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Lowcal_Sessions_Order_By>>;
  where?: InputMaybe<Lowcal_Sessions_Bool_Exp>;
};


export type Subscription_RootLowcal_Sessions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Lowcal_Sessions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Lowcal_Sessions_Order_By>>;
  where?: InputMaybe<Lowcal_Sessions_Bool_Exp>;
};


export type Subscription_RootLowcal_Sessions_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Subscription_RootOperationsArgs = {
  distinct_on?: InputMaybe<Array<Operations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Operations_Order_By>>;
  where?: InputMaybe<Operations_Bool_Exp>;
};


export type Subscription_RootOperations_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Operations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Operations_Order_By>>;
  where?: InputMaybe<Operations_Bool_Exp>;
};


export type Subscription_RootOperations_By_PkArgs = {
  id: Scalars['bigint'];
};


export type Subscription_RootPlanning_Constraints_RequestsArgs = {
  distinct_on?: InputMaybe<Array<Planning_Constraints_Requests_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Planning_Constraints_Requests_Order_By>>;
  where?: InputMaybe<Planning_Constraints_Requests_Bool_Exp>;
};


export type Subscription_RootPlanning_Constraints_Requests_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Planning_Constraints_Requests_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Planning_Constraints_Requests_Order_By>>;
  where?: InputMaybe<Planning_Constraints_Requests_Bool_Exp>;
};


export type Subscription_RootPlanning_Constraints_Requests_By_PkArgs = {
  id: Scalars['Int'];
};


export type Subscription_RootProject_TypesArgs = {
  distinct_on?: InputMaybe<Array<Project_Types_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Project_Types_Order_By>>;
  where?: InputMaybe<Project_Types_Bool_Exp>;
};


export type Subscription_RootProject_Types_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Project_Types_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Project_Types_Order_By>>;
  where?: InputMaybe<Project_Types_Bool_Exp>;
};


export type Subscription_RootProject_Types_By_PkArgs = {
  id: Scalars['Int'];
};


export type Subscription_RootPublished_FlowsArgs = {
  distinct_on?: InputMaybe<Array<Published_Flows_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Published_Flows_Order_By>>;
  where?: InputMaybe<Published_Flows_Bool_Exp>;
};


export type Subscription_RootPublished_Flows_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Published_Flows_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Published_Flows_Order_By>>;
  where?: InputMaybe<Published_Flows_Bool_Exp>;
};


export type Subscription_RootPublished_Flows_By_PkArgs = {
  id: Scalars['Int'];
};


export type Subscription_RootReconciliation_RequestsArgs = {
  distinct_on?: InputMaybe<Array<Reconciliation_Requests_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Reconciliation_Requests_Order_By>>;
  where?: InputMaybe<Reconciliation_Requests_Bool_Exp>;
};


export type Subscription_RootReconciliation_Requests_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Reconciliation_Requests_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Reconciliation_Requests_Order_By>>;
  where?: InputMaybe<Reconciliation_Requests_Bool_Exp>;
};


export type Subscription_RootReconciliation_Requests_By_PkArgs = {
  id: Scalars['Int'];
};


export type Subscription_RootSession_BackupsArgs = {
  distinct_on?: InputMaybe<Array<Session_Backups_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Session_Backups_Order_By>>;
  where?: InputMaybe<Session_Backups_Bool_Exp>;
};


export type Subscription_RootSession_Backups_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Session_Backups_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Session_Backups_Order_By>>;
  where?: InputMaybe<Session_Backups_Bool_Exp>;
};


export type Subscription_RootSession_Backups_By_PkArgs = {
  id: Scalars['Int'];
};


export type Subscription_RootTeam_MembersArgs = {
  distinct_on?: InputMaybe<Array<Team_Members_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Team_Members_Order_By>>;
  where?: InputMaybe<Team_Members_Bool_Exp>;
};


export type Subscription_RootTeam_Members_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Team_Members_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Team_Members_Order_By>>;
  where?: InputMaybe<Team_Members_Bool_Exp>;
};


export type Subscription_RootTeam_Members_By_PkArgs = {
  team_id: Scalars['Int'];
  user_id: Scalars['Int'];
};


export type Subscription_RootTeamsArgs = {
  distinct_on?: InputMaybe<Array<Teams_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Teams_Order_By>>;
  where?: InputMaybe<Teams_Bool_Exp>;
};


export type Subscription_RootTeams_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Teams_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Teams_Order_By>>;
  where?: InputMaybe<Teams_Bool_Exp>;
};


export type Subscription_RootTeams_By_PkArgs = {
  id: Scalars['Int'];
};


export type Subscription_RootUniform_ApplicationsArgs = {
  distinct_on?: InputMaybe<Array<Uniform_Applications_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Uniform_Applications_Order_By>>;
  where?: InputMaybe<Uniform_Applications_Bool_Exp>;
};


export type Subscription_RootUniform_Applications_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Uniform_Applications_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Uniform_Applications_Order_By>>;
  where?: InputMaybe<Uniform_Applications_Bool_Exp>;
};


export type Subscription_RootUniform_Applications_By_PkArgs = {
  id: Scalars['Int'];
};


export type Subscription_RootUsersArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Subscription_RootUsers_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Subscription_RootUsers_By_PkArgs = {
  id: Scalars['Int'];
};

/** Assigns `users` to `teams`, currently no differences in access or permission levels though */
export type Team_Members = {
  __typename?: 'team_members';
  created_at: Scalars['timestamptz'];
  /** An object relationship */
  creator: Users;
  creator_id: Scalars['Int'];
  /** An object relationship */
  team: Teams;
  team_id: Scalars['Int'];
  updated_at: Scalars['timestamptz'];
  /** An object relationship */
  user: Users;
  user_id: Scalars['Int'];
};

/** aggregated selection of "team_members" */
export type Team_Members_Aggregate = {
  __typename?: 'team_members_aggregate';
  aggregate?: Maybe<Team_Members_Aggregate_Fields>;
  nodes: Array<Team_Members>;
};

/** aggregate fields of "team_members" */
export type Team_Members_Aggregate_Fields = {
  __typename?: 'team_members_aggregate_fields';
  avg?: Maybe<Team_Members_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<Team_Members_Max_Fields>;
  min?: Maybe<Team_Members_Min_Fields>;
  stddev?: Maybe<Team_Members_Stddev_Fields>;
  stddev_pop?: Maybe<Team_Members_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Team_Members_Stddev_Samp_Fields>;
  sum?: Maybe<Team_Members_Sum_Fields>;
  var_pop?: Maybe<Team_Members_Var_Pop_Fields>;
  var_samp?: Maybe<Team_Members_Var_Samp_Fields>;
  variance?: Maybe<Team_Members_Variance_Fields>;
};


/** aggregate fields of "team_members" */
export type Team_Members_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Team_Members_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "team_members" */
export type Team_Members_Aggregate_Order_By = {
  avg?: InputMaybe<Team_Members_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Team_Members_Max_Order_By>;
  min?: InputMaybe<Team_Members_Min_Order_By>;
  stddev?: InputMaybe<Team_Members_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Team_Members_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Team_Members_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Team_Members_Sum_Order_By>;
  var_pop?: InputMaybe<Team_Members_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Team_Members_Var_Samp_Order_By>;
  variance?: InputMaybe<Team_Members_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "team_members" */
export type Team_Members_Arr_Rel_Insert_Input = {
  data: Array<Team_Members_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Team_Members_On_Conflict>;
};

/** aggregate avg on columns */
export type Team_Members_Avg_Fields = {
  __typename?: 'team_members_avg_fields';
  creator_id?: Maybe<Scalars['Float']>;
  team_id?: Maybe<Scalars['Float']>;
  user_id?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "team_members" */
export type Team_Members_Avg_Order_By = {
  creator_id?: InputMaybe<Order_By>;
  team_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "team_members". All fields are combined with a logical 'AND'. */
export type Team_Members_Bool_Exp = {
  _and?: InputMaybe<Array<Team_Members_Bool_Exp>>;
  _not?: InputMaybe<Team_Members_Bool_Exp>;
  _or?: InputMaybe<Array<Team_Members_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  creator?: InputMaybe<Users_Bool_Exp>;
  creator_id?: InputMaybe<Int_Comparison_Exp>;
  team?: InputMaybe<Teams_Bool_Exp>;
  team_id?: InputMaybe<Int_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
  user_id?: InputMaybe<Int_Comparison_Exp>;
};

/** unique or primary key constraints on table "team_members" */
export enum Team_Members_Constraint {
  /** unique or primary key constraint on columns "team_id", "user_id" */
  TeamMembersPkey = 'team_members_pkey'
}

/** input type for incrementing numeric columns in table "team_members" */
export type Team_Members_Inc_Input = {
  creator_id?: InputMaybe<Scalars['Int']>;
  team_id?: InputMaybe<Scalars['Int']>;
  user_id?: InputMaybe<Scalars['Int']>;
};

/** input type for inserting data into table "team_members" */
export type Team_Members_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']>;
  creator?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  creator_id?: InputMaybe<Scalars['Int']>;
  team?: InputMaybe<Teams_Obj_Rel_Insert_Input>;
  team_id?: InputMaybe<Scalars['Int']>;
  updated_at?: InputMaybe<Scalars['timestamptz']>;
  user?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  user_id?: InputMaybe<Scalars['Int']>;
};

/** aggregate max on columns */
export type Team_Members_Max_Fields = {
  __typename?: 'team_members_max_fields';
  created_at?: Maybe<Scalars['timestamptz']>;
  creator_id?: Maybe<Scalars['Int']>;
  team_id?: Maybe<Scalars['Int']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
  user_id?: Maybe<Scalars['Int']>;
};

/** order by max() on columns of table "team_members" */
export type Team_Members_Max_Order_By = {
  created_at?: InputMaybe<Order_By>;
  creator_id?: InputMaybe<Order_By>;
  team_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Team_Members_Min_Fields = {
  __typename?: 'team_members_min_fields';
  created_at?: Maybe<Scalars['timestamptz']>;
  creator_id?: Maybe<Scalars['Int']>;
  team_id?: Maybe<Scalars['Int']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
  user_id?: Maybe<Scalars['Int']>;
};

/** order by min() on columns of table "team_members" */
export type Team_Members_Min_Order_By = {
  created_at?: InputMaybe<Order_By>;
  creator_id?: InputMaybe<Order_By>;
  team_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "team_members" */
export type Team_Members_Mutation_Response = {
  __typename?: 'team_members_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Team_Members>;
};

/** on_conflict condition type for table "team_members" */
export type Team_Members_On_Conflict = {
  constraint: Team_Members_Constraint;
  update_columns?: Array<Team_Members_Update_Column>;
  where?: InputMaybe<Team_Members_Bool_Exp>;
};

/** Ordering options when selecting data from "team_members". */
export type Team_Members_Order_By = {
  created_at?: InputMaybe<Order_By>;
  creator?: InputMaybe<Users_Order_By>;
  creator_id?: InputMaybe<Order_By>;
  team?: InputMaybe<Teams_Order_By>;
  team_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: team_members */
export type Team_Members_Pk_Columns_Input = {
  team_id: Scalars['Int'];
  user_id: Scalars['Int'];
};

/** select columns of table "team_members" */
export enum Team_Members_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CreatorId = 'creator_id',
  /** column name */
  TeamId = 'team_id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id'
}

/** input type for updating data in table "team_members" */
export type Team_Members_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']>;
  creator_id?: InputMaybe<Scalars['Int']>;
  team_id?: InputMaybe<Scalars['Int']>;
  updated_at?: InputMaybe<Scalars['timestamptz']>;
  user_id?: InputMaybe<Scalars['Int']>;
};

/** aggregate stddev on columns */
export type Team_Members_Stddev_Fields = {
  __typename?: 'team_members_stddev_fields';
  creator_id?: Maybe<Scalars['Float']>;
  team_id?: Maybe<Scalars['Float']>;
  user_id?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "team_members" */
export type Team_Members_Stddev_Order_By = {
  creator_id?: InputMaybe<Order_By>;
  team_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Team_Members_Stddev_Pop_Fields = {
  __typename?: 'team_members_stddev_pop_fields';
  creator_id?: Maybe<Scalars['Float']>;
  team_id?: Maybe<Scalars['Float']>;
  user_id?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "team_members" */
export type Team_Members_Stddev_Pop_Order_By = {
  creator_id?: InputMaybe<Order_By>;
  team_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Team_Members_Stddev_Samp_Fields = {
  __typename?: 'team_members_stddev_samp_fields';
  creator_id?: Maybe<Scalars['Float']>;
  team_id?: Maybe<Scalars['Float']>;
  user_id?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "team_members" */
export type Team_Members_Stddev_Samp_Order_By = {
  creator_id?: InputMaybe<Order_By>;
  team_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type Team_Members_Sum_Fields = {
  __typename?: 'team_members_sum_fields';
  creator_id?: Maybe<Scalars['Int']>;
  team_id?: Maybe<Scalars['Int']>;
  user_id?: Maybe<Scalars['Int']>;
};

/** order by sum() on columns of table "team_members" */
export type Team_Members_Sum_Order_By = {
  creator_id?: InputMaybe<Order_By>;
  team_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** update columns of table "team_members" */
export enum Team_Members_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CreatorId = 'creator_id',
  /** column name */
  TeamId = 'team_id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id'
}

/** aggregate var_pop on columns */
export type Team_Members_Var_Pop_Fields = {
  __typename?: 'team_members_var_pop_fields';
  creator_id?: Maybe<Scalars['Float']>;
  team_id?: Maybe<Scalars['Float']>;
  user_id?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "team_members" */
export type Team_Members_Var_Pop_Order_By = {
  creator_id?: InputMaybe<Order_By>;
  team_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Team_Members_Var_Samp_Fields = {
  __typename?: 'team_members_var_samp_fields';
  creator_id?: Maybe<Scalars['Float']>;
  team_id?: Maybe<Scalars['Float']>;
  user_id?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "team_members" */
export type Team_Members_Var_Samp_Order_By = {
  creator_id?: InputMaybe<Order_By>;
  team_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Team_Members_Variance_Fields = {
  __typename?: 'team_members_variance_fields';
  creator_id?: Maybe<Scalars['Float']>;
  team_id?: Maybe<Scalars['Float']>;
  user_id?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "team_members" */
export type Team_Members_Variance_Order_By = {
  creator_id?: InputMaybe<Order_By>;
  team_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Teams are core way we organise `flows` and configure settings like theme colour, logo, and contact info; name usually reflects a council but not exclusively */
export type Teams = {
  __typename?: 'teams';
  created_at: Scalars['timestamptz'];
  domain?: Maybe<Scalars['String']>;
  /** An array relationship */
  flows: Array<Flows>;
  /** An aggregate relationship */
  flows_aggregate: Flows_Aggregate;
  id: Scalars['Int'];
  /** An array relationship */
  members: Array<Team_Members>;
  /** An aggregate relationship */
  members_aggregate: Team_Members_Aggregate;
  name: Scalars['String'];
  notify_personalisation?: Maybe<Scalars['jsonb']>;
  settings?: Maybe<Scalars['jsonb']>;
  slug: Scalars['String'];
  theme: Scalars['jsonb'];
  updated_at: Scalars['timestamptz'];
};


/** Teams are core way we organise `flows` and configure settings like theme colour, logo, and contact info; name usually reflects a council but not exclusively */
export type TeamsFlowsArgs = {
  distinct_on?: InputMaybe<Array<Flows_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flows_Order_By>>;
  where?: InputMaybe<Flows_Bool_Exp>;
};


/** Teams are core way we organise `flows` and configure settings like theme colour, logo, and contact info; name usually reflects a council but not exclusively */
export type TeamsFlows_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flows_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flows_Order_By>>;
  where?: InputMaybe<Flows_Bool_Exp>;
};


/** Teams are core way we organise `flows` and configure settings like theme colour, logo, and contact info; name usually reflects a council but not exclusively */
export type TeamsMembersArgs = {
  distinct_on?: InputMaybe<Array<Team_Members_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Team_Members_Order_By>>;
  where?: InputMaybe<Team_Members_Bool_Exp>;
};


/** Teams are core way we organise `flows` and configure settings like theme colour, logo, and contact info; name usually reflects a council but not exclusively */
export type TeamsMembers_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Team_Members_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Team_Members_Order_By>>;
  where?: InputMaybe<Team_Members_Bool_Exp>;
};


/** Teams are core way we organise `flows` and configure settings like theme colour, logo, and contact info; name usually reflects a council but not exclusively */
export type TeamsNotify_PersonalisationArgs = {
  path?: InputMaybe<Scalars['String']>;
};


/** Teams are core way we organise `flows` and configure settings like theme colour, logo, and contact info; name usually reflects a council but not exclusively */
export type TeamsSettingsArgs = {
  path?: InputMaybe<Scalars['String']>;
};


/** Teams are core way we organise `flows` and configure settings like theme colour, logo, and contact info; name usually reflects a council but not exclusively */
export type TeamsThemeArgs = {
  path?: InputMaybe<Scalars['String']>;
};

/** aggregated selection of "teams" */
export type Teams_Aggregate = {
  __typename?: 'teams_aggregate';
  aggregate?: Maybe<Teams_Aggregate_Fields>;
  nodes: Array<Teams>;
};

/** aggregate fields of "teams" */
export type Teams_Aggregate_Fields = {
  __typename?: 'teams_aggregate_fields';
  avg?: Maybe<Teams_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<Teams_Max_Fields>;
  min?: Maybe<Teams_Min_Fields>;
  stddev?: Maybe<Teams_Stddev_Fields>;
  stddev_pop?: Maybe<Teams_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Teams_Stddev_Samp_Fields>;
  sum?: Maybe<Teams_Sum_Fields>;
  var_pop?: Maybe<Teams_Var_Pop_Fields>;
  var_samp?: Maybe<Teams_Var_Samp_Fields>;
  variance?: Maybe<Teams_Variance_Fields>;
};


/** aggregate fields of "teams" */
export type Teams_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Teams_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Teams_Append_Input = {
  notify_personalisation?: InputMaybe<Scalars['jsonb']>;
  settings?: InputMaybe<Scalars['jsonb']>;
  theme?: InputMaybe<Scalars['jsonb']>;
};

/** aggregate avg on columns */
export type Teams_Avg_Fields = {
  __typename?: 'teams_avg_fields';
  id?: Maybe<Scalars['Float']>;
};

/** Boolean expression to filter rows from the table "teams". All fields are combined with a logical 'AND'. */
export type Teams_Bool_Exp = {
  _and?: InputMaybe<Array<Teams_Bool_Exp>>;
  _not?: InputMaybe<Teams_Bool_Exp>;
  _or?: InputMaybe<Array<Teams_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  domain?: InputMaybe<String_Comparison_Exp>;
  flows?: InputMaybe<Flows_Bool_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  members?: InputMaybe<Team_Members_Bool_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  notify_personalisation?: InputMaybe<Jsonb_Comparison_Exp>;
  settings?: InputMaybe<Jsonb_Comparison_Exp>;
  slug?: InputMaybe<String_Comparison_Exp>;
  theme?: InputMaybe<Jsonb_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "teams" */
export enum Teams_Constraint {
  /** unique or primary key constraint on columns "domain" */
  TeamsDomainKey = 'teams_domain_key',
  /** unique or primary key constraint on columns "id" */
  TeamsPkey = 'teams_pkey',
  /** unique or primary key constraint on columns "slug" */
  TeamsSlugKey = 'teams_slug_key'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Teams_Delete_At_Path_Input = {
  notify_personalisation?: InputMaybe<Array<Scalars['String']>>;
  settings?: InputMaybe<Array<Scalars['String']>>;
  theme?: InputMaybe<Array<Scalars['String']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Teams_Delete_Elem_Input = {
  notify_personalisation?: InputMaybe<Scalars['Int']>;
  settings?: InputMaybe<Scalars['Int']>;
  theme?: InputMaybe<Scalars['Int']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Teams_Delete_Key_Input = {
  notify_personalisation?: InputMaybe<Scalars['String']>;
  settings?: InputMaybe<Scalars['String']>;
  theme?: InputMaybe<Scalars['String']>;
};

/** input type for incrementing numeric columns in table "teams" */
export type Teams_Inc_Input = {
  id?: InputMaybe<Scalars['Int']>;
};

/** input type for inserting data into table "teams" */
export type Teams_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']>;
  domain?: InputMaybe<Scalars['String']>;
  flows?: InputMaybe<Flows_Arr_Rel_Insert_Input>;
  id?: InputMaybe<Scalars['Int']>;
  members?: InputMaybe<Team_Members_Arr_Rel_Insert_Input>;
  name?: InputMaybe<Scalars['String']>;
  notify_personalisation?: InputMaybe<Scalars['jsonb']>;
  settings?: InputMaybe<Scalars['jsonb']>;
  slug?: InputMaybe<Scalars['String']>;
  theme?: InputMaybe<Scalars['jsonb']>;
  updated_at?: InputMaybe<Scalars['timestamptz']>;
};

/** aggregate max on columns */
export type Teams_Max_Fields = {
  __typename?: 'teams_max_fields';
  created_at?: Maybe<Scalars['timestamptz']>;
  domain?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Int']>;
  name?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
};

/** aggregate min on columns */
export type Teams_Min_Fields = {
  __typename?: 'teams_min_fields';
  created_at?: Maybe<Scalars['timestamptz']>;
  domain?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Int']>;
  name?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
};

/** response of any mutation on the table "teams" */
export type Teams_Mutation_Response = {
  __typename?: 'teams_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Teams>;
};

/** input type for inserting object relation for remote table "teams" */
export type Teams_Obj_Rel_Insert_Input = {
  data: Teams_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Teams_On_Conflict>;
};

/** on_conflict condition type for table "teams" */
export type Teams_On_Conflict = {
  constraint: Teams_Constraint;
  update_columns?: Array<Teams_Update_Column>;
  where?: InputMaybe<Teams_Bool_Exp>;
};

/** Ordering options when selecting data from "teams". */
export type Teams_Order_By = {
  created_at?: InputMaybe<Order_By>;
  domain?: InputMaybe<Order_By>;
  flows_aggregate?: InputMaybe<Flows_Aggregate_Order_By>;
  id?: InputMaybe<Order_By>;
  members_aggregate?: InputMaybe<Team_Members_Aggregate_Order_By>;
  name?: InputMaybe<Order_By>;
  notify_personalisation?: InputMaybe<Order_By>;
  settings?: InputMaybe<Order_By>;
  slug?: InputMaybe<Order_By>;
  theme?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: teams */
export type Teams_Pk_Columns_Input = {
  id: Scalars['Int'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Teams_Prepend_Input = {
  notify_personalisation?: InputMaybe<Scalars['jsonb']>;
  settings?: InputMaybe<Scalars['jsonb']>;
  theme?: InputMaybe<Scalars['jsonb']>;
};

/** select columns of table "teams" */
export enum Teams_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Domain = 'domain',
  /** column name */
  Id = 'id',
  /** column name */
  Name = 'name',
  /** column name */
  NotifyPersonalisation = 'notify_personalisation',
  /** column name */
  Settings = 'settings',
  /** column name */
  Slug = 'slug',
  /** column name */
  Theme = 'theme',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** input type for updating data in table "teams" */
export type Teams_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']>;
  domain?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Int']>;
  name?: InputMaybe<Scalars['String']>;
  notify_personalisation?: InputMaybe<Scalars['jsonb']>;
  settings?: InputMaybe<Scalars['jsonb']>;
  slug?: InputMaybe<Scalars['String']>;
  theme?: InputMaybe<Scalars['jsonb']>;
  updated_at?: InputMaybe<Scalars['timestamptz']>;
};

/** aggregate stddev on columns */
export type Teams_Stddev_Fields = {
  __typename?: 'teams_stddev_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_pop on columns */
export type Teams_Stddev_Pop_Fields = {
  __typename?: 'teams_stddev_pop_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_samp on columns */
export type Teams_Stddev_Samp_Fields = {
  __typename?: 'teams_stddev_samp_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate sum on columns */
export type Teams_Sum_Fields = {
  __typename?: 'teams_sum_fields';
  id?: Maybe<Scalars['Int']>;
};

/** update columns of table "teams" */
export enum Teams_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Domain = 'domain',
  /** column name */
  Id = 'id',
  /** column name */
  Name = 'name',
  /** column name */
  NotifyPersonalisation = 'notify_personalisation',
  /** column name */
  Settings = 'settings',
  /** column name */
  Slug = 'slug',
  /** column name */
  Theme = 'theme',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** aggregate var_pop on columns */
export type Teams_Var_Pop_Fields = {
  __typename?: 'teams_var_pop_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate var_samp on columns */
export type Teams_Var_Samp_Fields = {
  __typename?: 'teams_var_samp_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate variance on columns */
export type Teams_Variance_Fields = {
  __typename?: 'teams_variance_fields';
  id?: Maybe<Scalars['Float']>;
};

/** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
export type Timestamptz_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['timestamptz']>;
  _gt?: InputMaybe<Scalars['timestamptz']>;
  _gte?: InputMaybe<Scalars['timestamptz']>;
  _in?: InputMaybe<Array<Scalars['timestamptz']>>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  _lt?: InputMaybe<Scalars['timestamptz']>;
  _lte?: InputMaybe<Scalars['timestamptz']>;
  _neq?: InputMaybe<Scalars['timestamptz']>;
  _nin?: InputMaybe<Array<Scalars['timestamptz']>>;
};

/** Stores a receipt of applications submitted to Idox/Uniform */
export type Uniform_Applications = {
  __typename?: 'uniform_applications';
  created_at: Scalars['timestamptz'];
  /** Does not link directly to `team` because one council may have multiple Uniform instances */
  destination?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  idox_submission_id?: Maybe<Scalars['String']>;
  /** Payload which generated this submission to Uniform */
  payload?: Maybe<Scalars['jsonb']>;
  response?: Maybe<Scalars['jsonb']>;
  /** Unique identifier provided by RIPA, must match XML <portaloneapp:RefNum> */
  submission_reference?: Maybe<Scalars['String']>;
};


/** Stores a receipt of applications submitted to Idox/Uniform */
export type Uniform_ApplicationsPayloadArgs = {
  path?: InputMaybe<Scalars['String']>;
};


/** Stores a receipt of applications submitted to Idox/Uniform */
export type Uniform_ApplicationsResponseArgs = {
  path?: InputMaybe<Scalars['String']>;
};

/** aggregated selection of "uniform_applications" */
export type Uniform_Applications_Aggregate = {
  __typename?: 'uniform_applications_aggregate';
  aggregate?: Maybe<Uniform_Applications_Aggregate_Fields>;
  nodes: Array<Uniform_Applications>;
};

/** aggregate fields of "uniform_applications" */
export type Uniform_Applications_Aggregate_Fields = {
  __typename?: 'uniform_applications_aggregate_fields';
  avg?: Maybe<Uniform_Applications_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<Uniform_Applications_Max_Fields>;
  min?: Maybe<Uniform_Applications_Min_Fields>;
  stddev?: Maybe<Uniform_Applications_Stddev_Fields>;
  stddev_pop?: Maybe<Uniform_Applications_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Uniform_Applications_Stddev_Samp_Fields>;
  sum?: Maybe<Uniform_Applications_Sum_Fields>;
  var_pop?: Maybe<Uniform_Applications_Var_Pop_Fields>;
  var_samp?: Maybe<Uniform_Applications_Var_Samp_Fields>;
  variance?: Maybe<Uniform_Applications_Variance_Fields>;
};


/** aggregate fields of "uniform_applications" */
export type Uniform_Applications_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Uniform_Applications_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Uniform_Applications_Append_Input = {
  /** Payload which generated this submission to Uniform */
  payload?: InputMaybe<Scalars['jsonb']>;
  response?: InputMaybe<Scalars['jsonb']>;
};

/** aggregate avg on columns */
export type Uniform_Applications_Avg_Fields = {
  __typename?: 'uniform_applications_avg_fields';
  id?: Maybe<Scalars['Float']>;
};

/** Boolean expression to filter rows from the table "uniform_applications". All fields are combined with a logical 'AND'. */
export type Uniform_Applications_Bool_Exp = {
  _and?: InputMaybe<Array<Uniform_Applications_Bool_Exp>>;
  _not?: InputMaybe<Uniform_Applications_Bool_Exp>;
  _or?: InputMaybe<Array<Uniform_Applications_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  destination?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  idox_submission_id?: InputMaybe<String_Comparison_Exp>;
  payload?: InputMaybe<Jsonb_Comparison_Exp>;
  response?: InputMaybe<Jsonb_Comparison_Exp>;
  submission_reference?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "uniform_applications" */
export enum Uniform_Applications_Constraint {
  /** unique or primary key constraint on columns "id" */
  UniformApplicationsPkey = 'uniform_applications_pkey'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Uniform_Applications_Delete_At_Path_Input = {
  /** Payload which generated this submission to Uniform */
  payload?: InputMaybe<Array<Scalars['String']>>;
  response?: InputMaybe<Array<Scalars['String']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Uniform_Applications_Delete_Elem_Input = {
  /** Payload which generated this submission to Uniform */
  payload?: InputMaybe<Scalars['Int']>;
  response?: InputMaybe<Scalars['Int']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Uniform_Applications_Delete_Key_Input = {
  /** Payload which generated this submission to Uniform */
  payload?: InputMaybe<Scalars['String']>;
  response?: InputMaybe<Scalars['String']>;
};

/** input type for incrementing numeric columns in table "uniform_applications" */
export type Uniform_Applications_Inc_Input = {
  id?: InputMaybe<Scalars['Int']>;
};

/** input type for inserting data into table "uniform_applications" */
export type Uniform_Applications_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']>;
  /** Does not link directly to `team` because one council may have multiple Uniform instances */
  destination?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Int']>;
  idox_submission_id?: InputMaybe<Scalars['String']>;
  /** Payload which generated this submission to Uniform */
  payload?: InputMaybe<Scalars['jsonb']>;
  response?: InputMaybe<Scalars['jsonb']>;
  /** Unique identifier provided by RIPA, must match XML <portaloneapp:RefNum> */
  submission_reference?: InputMaybe<Scalars['String']>;
};

/** aggregate max on columns */
export type Uniform_Applications_Max_Fields = {
  __typename?: 'uniform_applications_max_fields';
  created_at?: Maybe<Scalars['timestamptz']>;
  /** Does not link directly to `team` because one council may have multiple Uniform instances */
  destination?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Int']>;
  idox_submission_id?: Maybe<Scalars['String']>;
  /** Unique identifier provided by RIPA, must match XML <portaloneapp:RefNum> */
  submission_reference?: Maybe<Scalars['String']>;
};

/** aggregate min on columns */
export type Uniform_Applications_Min_Fields = {
  __typename?: 'uniform_applications_min_fields';
  created_at?: Maybe<Scalars['timestamptz']>;
  /** Does not link directly to `team` because one council may have multiple Uniform instances */
  destination?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Int']>;
  idox_submission_id?: Maybe<Scalars['String']>;
  /** Unique identifier provided by RIPA, must match XML <portaloneapp:RefNum> */
  submission_reference?: Maybe<Scalars['String']>;
};

/** response of any mutation on the table "uniform_applications" */
export type Uniform_Applications_Mutation_Response = {
  __typename?: 'uniform_applications_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Uniform_Applications>;
};

/** on_conflict condition type for table "uniform_applications" */
export type Uniform_Applications_On_Conflict = {
  constraint: Uniform_Applications_Constraint;
  update_columns?: Array<Uniform_Applications_Update_Column>;
  where?: InputMaybe<Uniform_Applications_Bool_Exp>;
};

/** Ordering options when selecting data from "uniform_applications". */
export type Uniform_Applications_Order_By = {
  created_at?: InputMaybe<Order_By>;
  destination?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  idox_submission_id?: InputMaybe<Order_By>;
  payload?: InputMaybe<Order_By>;
  response?: InputMaybe<Order_By>;
  submission_reference?: InputMaybe<Order_By>;
};

/** primary key columns input for table: uniform_applications */
export type Uniform_Applications_Pk_Columns_Input = {
  id: Scalars['Int'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Uniform_Applications_Prepend_Input = {
  /** Payload which generated this submission to Uniform */
  payload?: InputMaybe<Scalars['jsonb']>;
  response?: InputMaybe<Scalars['jsonb']>;
};

/** select columns of table "uniform_applications" */
export enum Uniform_Applications_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Destination = 'destination',
  /** column name */
  Id = 'id',
  /** column name */
  IdoxSubmissionId = 'idox_submission_id',
  /** column name */
  Payload = 'payload',
  /** column name */
  Response = 'response',
  /** column name */
  SubmissionReference = 'submission_reference'
}

/** input type for updating data in table "uniform_applications" */
export type Uniform_Applications_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']>;
  /** Does not link directly to `team` because one council may have multiple Uniform instances */
  destination?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Int']>;
  idox_submission_id?: InputMaybe<Scalars['String']>;
  /** Payload which generated this submission to Uniform */
  payload?: InputMaybe<Scalars['jsonb']>;
  response?: InputMaybe<Scalars['jsonb']>;
  /** Unique identifier provided by RIPA, must match XML <portaloneapp:RefNum> */
  submission_reference?: InputMaybe<Scalars['String']>;
};

/** aggregate stddev on columns */
export type Uniform_Applications_Stddev_Fields = {
  __typename?: 'uniform_applications_stddev_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_pop on columns */
export type Uniform_Applications_Stddev_Pop_Fields = {
  __typename?: 'uniform_applications_stddev_pop_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_samp on columns */
export type Uniform_Applications_Stddev_Samp_Fields = {
  __typename?: 'uniform_applications_stddev_samp_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate sum on columns */
export type Uniform_Applications_Sum_Fields = {
  __typename?: 'uniform_applications_sum_fields';
  id?: Maybe<Scalars['Int']>;
};

/** update columns of table "uniform_applications" */
export enum Uniform_Applications_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Destination = 'destination',
  /** column name */
  Id = 'id',
  /** column name */
  IdoxSubmissionId = 'idox_submission_id',
  /** column name */
  Payload = 'payload',
  /** column name */
  Response = 'response',
  /** column name */
  SubmissionReference = 'submission_reference'
}

/** aggregate var_pop on columns */
export type Uniform_Applications_Var_Pop_Fields = {
  __typename?: 'uniform_applications_var_pop_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate var_samp on columns */
export type Uniform_Applications_Var_Samp_Fields = {
  __typename?: 'uniform_applications_var_samp_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate variance on columns */
export type Uniform_Applications_Variance_Fields = {
  __typename?: 'uniform_applications_variance_fields';
  id?: Maybe<Scalars['Float']>;
};

/** Grants access to the Editor, currently requires a Google email for single sign-on */
export type Users = {
  __typename?: 'users';
  created_at: Scalars['timestamptz'];
  /** An array relationship */
  created_flows: Array<Flows>;
  /** An aggregate relationship */
  created_flows_aggregate: Flows_Aggregate;
  /** An array relationship */
  created_team_members: Array<Team_Members>;
  /** An aggregate relationship */
  created_team_members_aggregate: Team_Members_Aggregate;
  /** Create mulitple entries if a user's email includes "." or "@googlemail.com"; replace address with "_REMOVED_" to restrict access but retain their edits/`operations` until soft deletes are implemented */
  email: Scalars['String'];
  first_name: Scalars['String'];
  id: Scalars['Int'];
  is_admin: Scalars['Boolean'];
  last_name: Scalars['String'];
  /** An array relationship */
  operations: Array<Operations>;
  /** An aggregate relationship */
  operations_aggregate: Operations_Aggregate;
  /** An array relationship */
  team_members: Array<Team_Members>;
  /** An aggregate relationship */
  team_members_aggregate: Team_Members_Aggregate;
  updated_at: Scalars['timestamptz'];
};


/** Grants access to the Editor, currently requires a Google email for single sign-on */
export type UsersCreated_FlowsArgs = {
  distinct_on?: InputMaybe<Array<Flows_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flows_Order_By>>;
  where?: InputMaybe<Flows_Bool_Exp>;
};


/** Grants access to the Editor, currently requires a Google email for single sign-on */
export type UsersCreated_Flows_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flows_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flows_Order_By>>;
  where?: InputMaybe<Flows_Bool_Exp>;
};


/** Grants access to the Editor, currently requires a Google email for single sign-on */
export type UsersCreated_Team_MembersArgs = {
  distinct_on?: InputMaybe<Array<Team_Members_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Team_Members_Order_By>>;
  where?: InputMaybe<Team_Members_Bool_Exp>;
};


/** Grants access to the Editor, currently requires a Google email for single sign-on */
export type UsersCreated_Team_Members_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Team_Members_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Team_Members_Order_By>>;
  where?: InputMaybe<Team_Members_Bool_Exp>;
};


/** Grants access to the Editor, currently requires a Google email for single sign-on */
export type UsersOperationsArgs = {
  distinct_on?: InputMaybe<Array<Operations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Operations_Order_By>>;
  where?: InputMaybe<Operations_Bool_Exp>;
};


/** Grants access to the Editor, currently requires a Google email for single sign-on */
export type UsersOperations_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Operations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Operations_Order_By>>;
  where?: InputMaybe<Operations_Bool_Exp>;
};


/** Grants access to the Editor, currently requires a Google email for single sign-on */
export type UsersTeam_MembersArgs = {
  distinct_on?: InputMaybe<Array<Team_Members_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Team_Members_Order_By>>;
  where?: InputMaybe<Team_Members_Bool_Exp>;
};


/** Grants access to the Editor, currently requires a Google email for single sign-on */
export type UsersTeam_Members_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Team_Members_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Team_Members_Order_By>>;
  where?: InputMaybe<Team_Members_Bool_Exp>;
};

/** aggregated selection of "users" */
export type Users_Aggregate = {
  __typename?: 'users_aggregate';
  aggregate?: Maybe<Users_Aggregate_Fields>;
  nodes: Array<Users>;
};

/** aggregate fields of "users" */
export type Users_Aggregate_Fields = {
  __typename?: 'users_aggregate_fields';
  avg?: Maybe<Users_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<Users_Max_Fields>;
  min?: Maybe<Users_Min_Fields>;
  stddev?: Maybe<Users_Stddev_Fields>;
  stddev_pop?: Maybe<Users_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Users_Stddev_Samp_Fields>;
  sum?: Maybe<Users_Sum_Fields>;
  var_pop?: Maybe<Users_Var_Pop_Fields>;
  var_samp?: Maybe<Users_Var_Samp_Fields>;
  variance?: Maybe<Users_Variance_Fields>;
};


/** aggregate fields of "users" */
export type Users_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Users_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** aggregate avg on columns */
export type Users_Avg_Fields = {
  __typename?: 'users_avg_fields';
  id?: Maybe<Scalars['Float']>;
};

/** Boolean expression to filter rows from the table "users". All fields are combined with a logical 'AND'. */
export type Users_Bool_Exp = {
  _and?: InputMaybe<Array<Users_Bool_Exp>>;
  _not?: InputMaybe<Users_Bool_Exp>;
  _or?: InputMaybe<Array<Users_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  created_flows?: InputMaybe<Flows_Bool_Exp>;
  created_team_members?: InputMaybe<Team_Members_Bool_Exp>;
  email?: InputMaybe<String_Comparison_Exp>;
  first_name?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  is_admin?: InputMaybe<Boolean_Comparison_Exp>;
  last_name?: InputMaybe<String_Comparison_Exp>;
  operations?: InputMaybe<Operations_Bool_Exp>;
  team_members?: InputMaybe<Team_Members_Bool_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "users" */
export enum Users_Constraint {
  /** unique or primary key constraint on columns "email" */
  UsersEmailKey = 'users_email_key',
  /** unique or primary key constraint on columns "id" */
  UsersPkey = 'users_pkey'
}

/** input type for incrementing numeric columns in table "users" */
export type Users_Inc_Input = {
  id?: InputMaybe<Scalars['Int']>;
};

/** input type for inserting data into table "users" */
export type Users_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']>;
  created_flows?: InputMaybe<Flows_Arr_Rel_Insert_Input>;
  created_team_members?: InputMaybe<Team_Members_Arr_Rel_Insert_Input>;
  /** Create mulitple entries if a user's email includes "." or "@googlemail.com"; replace address with "_REMOVED_" to restrict access but retain their edits/`operations` until soft deletes are implemented */
  email?: InputMaybe<Scalars['String']>;
  first_name?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Int']>;
  is_admin?: InputMaybe<Scalars['Boolean']>;
  last_name?: InputMaybe<Scalars['String']>;
  operations?: InputMaybe<Operations_Arr_Rel_Insert_Input>;
  team_members?: InputMaybe<Team_Members_Arr_Rel_Insert_Input>;
  updated_at?: InputMaybe<Scalars['timestamptz']>;
};

/** aggregate max on columns */
export type Users_Max_Fields = {
  __typename?: 'users_max_fields';
  created_at?: Maybe<Scalars['timestamptz']>;
  /** Create mulitple entries if a user's email includes "." or "@googlemail.com"; replace address with "_REMOVED_" to restrict access but retain their edits/`operations` until soft deletes are implemented */
  email?: Maybe<Scalars['String']>;
  first_name?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Int']>;
  last_name?: Maybe<Scalars['String']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
};

/** aggregate min on columns */
export type Users_Min_Fields = {
  __typename?: 'users_min_fields';
  created_at?: Maybe<Scalars['timestamptz']>;
  /** Create mulitple entries if a user's email includes "." or "@googlemail.com"; replace address with "_REMOVED_" to restrict access but retain their edits/`operations` until soft deletes are implemented */
  email?: Maybe<Scalars['String']>;
  first_name?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Int']>;
  last_name?: Maybe<Scalars['String']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
};

/** response of any mutation on the table "users" */
export type Users_Mutation_Response = {
  __typename?: 'users_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Users>;
};

/** input type for inserting object relation for remote table "users" */
export type Users_Obj_Rel_Insert_Input = {
  data: Users_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Users_On_Conflict>;
};

/** on_conflict condition type for table "users" */
export type Users_On_Conflict = {
  constraint: Users_Constraint;
  update_columns?: Array<Users_Update_Column>;
  where?: InputMaybe<Users_Bool_Exp>;
};

/** Ordering options when selecting data from "users". */
export type Users_Order_By = {
  created_at?: InputMaybe<Order_By>;
  created_flows_aggregate?: InputMaybe<Flows_Aggregate_Order_By>;
  created_team_members_aggregate?: InputMaybe<Team_Members_Aggregate_Order_By>;
  email?: InputMaybe<Order_By>;
  first_name?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_admin?: InputMaybe<Order_By>;
  last_name?: InputMaybe<Order_By>;
  operations_aggregate?: InputMaybe<Operations_Aggregate_Order_By>;
  team_members_aggregate?: InputMaybe<Team_Members_Aggregate_Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: users */
export type Users_Pk_Columns_Input = {
  id: Scalars['Int'];
};

/** select columns of table "users" */
export enum Users_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Email = 'email',
  /** column name */
  FirstName = 'first_name',
  /** column name */
  Id = 'id',
  /** column name */
  IsAdmin = 'is_admin',
  /** column name */
  LastName = 'last_name',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** input type for updating data in table "users" */
export type Users_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']>;
  /** Create mulitple entries if a user's email includes "." or "@googlemail.com"; replace address with "_REMOVED_" to restrict access but retain their edits/`operations` until soft deletes are implemented */
  email?: InputMaybe<Scalars['String']>;
  first_name?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Int']>;
  is_admin?: InputMaybe<Scalars['Boolean']>;
  last_name?: InputMaybe<Scalars['String']>;
  updated_at?: InputMaybe<Scalars['timestamptz']>;
};

/** aggregate stddev on columns */
export type Users_Stddev_Fields = {
  __typename?: 'users_stddev_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_pop on columns */
export type Users_Stddev_Pop_Fields = {
  __typename?: 'users_stddev_pop_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_samp on columns */
export type Users_Stddev_Samp_Fields = {
  __typename?: 'users_stddev_samp_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate sum on columns */
export type Users_Sum_Fields = {
  __typename?: 'users_sum_fields';
  id?: Maybe<Scalars['Int']>;
};

/** update columns of table "users" */
export enum Users_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Email = 'email',
  /** column name */
  FirstName = 'first_name',
  /** column name */
  Id = 'id',
  /** column name */
  IsAdmin = 'is_admin',
  /** column name */
  LastName = 'last_name',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** aggregate var_pop on columns */
export type Users_Var_Pop_Fields = {
  __typename?: 'users_var_pop_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate var_samp on columns */
export type Users_Var_Samp_Fields = {
  __typename?: 'users_var_samp_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate variance on columns */
export type Users_Variance_Fields = {
  __typename?: 'users_variance_fields';
  id?: Maybe<Scalars['Float']>;
};

/** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
export type Uuid_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['uuid']>;
  _gt?: InputMaybe<Scalars['uuid']>;
  _gte?: InputMaybe<Scalars['uuid']>;
  _in?: InputMaybe<Array<Scalars['uuid']>>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  _lt?: InputMaybe<Scalars['uuid']>;
  _lte?: InputMaybe<Scalars['uuid']>;
  _neq?: InputMaybe<Scalars['uuid']>;
  _nin?: InputMaybe<Array<Scalars['uuid']>>;
};

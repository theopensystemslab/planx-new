export const GRAPHQL_USER_ALREADY_EXISTS_ERROR = {
  message:
    'Uniqueness violation. duplicate key value violates unique constraint "users_email_key"',
  graphQLErrors: [
    {
      message:
        'Uniqueness violation. duplicate key value violates unique constraint "users_email_key"',
      extensions: {
        path: "$.selectionSet.insert_users_one.args.object[0]",
        code: "constraint-violation",
      },
    },
  ],
};

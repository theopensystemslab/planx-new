import gql from "graphql-tag";

export const SELECT_USERS_QUERY = gql`
  query SelectUsersE2E($user1Id: Int!) {
    result: users_by_pk(id: $user1Id) {
      id
    }
  }
`;

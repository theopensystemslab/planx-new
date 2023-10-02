import gql from "graphql-tag";

export const SELECT_TEAM_MEMBERS_QUERY = gql`
  query SelectTeamMembersE2E($user1Id: Int) {
    result: team_members(where: { user_id: { _eq: $user1Id } }) {
      id
    }
  }
`;

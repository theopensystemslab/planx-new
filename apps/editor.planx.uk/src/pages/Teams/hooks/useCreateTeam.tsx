import { gql, useMutation } from "@apollo/client";

const CREATE_TEAM_MUTATION = gql`
  mutation CreateTeam(
    $name: String!
    $slug: String!
    $domain: String
    $settings: team_settings_insert_input!
    $theme: team_themes_insert_input!
  ) {
    insert_teams_one(
      object: {
        name: $name
        slug: $slug
        # Create empty records for associated tables - these can get populated later
        team_settings: { data: $settings }
        theme: { data: $theme }
        integrations: { data: {} }
      }
    ) {
      id
    }
  }
`;

export interface TeamPayload {
  name: string;
  slug: string;
  settings: {
    isTrial: boolean;
  };
}

export const useCreateTeam = () => {
  const [mutate, mutationState] = useMutation(CREATE_TEAM_MUTATION);

  const createTeam = async ({ name, slug, settings }: TeamPayload) => {
    return mutate({
      variables: {
        name,
        slug,
        settings: {
          is_trial: settings.isTrial,
        },
        theme: {},
      },
    });
  };

  return { createTeam, ...mutationState };
};

import { gql, useMutation } from "@apollo/client";

const CREATE_TEAM_MUTATION = gql`
  mutation CreateTeam(
    $name: String!
    $slug: String!
    $isLpa: Boolean!
    $domain: String
    $settings: team_settings_insert_input!
    $theme: team_themes_insert_input!
    $invoice_details: team_invoice_details_insert_input!
  ) {
    insert_teams_one(
      object: {
        name: $name
        slug: $slug
        is_lpa: $isLpa
        # Create empty records for associated tables - these can get populated later
        team_settings: { data: $settings }
        theme: { data: $theme }
        integrations: { data: {} }
        invoice_details: { data: $invoice_details }
      }
    ) {
      id
    }
  }
`;

export interface TeamPayload {
  name: string;
  slug: string;
  isLpa: boolean;
  settings: {
    isTrial: boolean;
  };
}

export const useCreateTeam = () => {
  const [mutate, mutationState] = useMutation(CREATE_TEAM_MUTATION);

  const createTeam = async ({ name, slug, isLpa, settings }: TeamPayload) => {
    return mutate({
      variables: {
        name,
        slug,
        isLpa,
        settings: {
          is_trial: settings.isTrial,
        },
        theme: {},
        invoice_details: {},
      },
    });
  };

  return { createTeam, ...mutationState };
};

import { gql, useMutation } from "@apollo/client";
import type { TeamCategory } from "lib/teamCategories";

const CREATE_TEAM_MUTATION = gql`
  mutation CreateTeam(
    $name: String!
    $slug: String!
    $category: team_category_enum_enum!
    $domain: String
    $settings: team_settings_insert_input!
    $theme: team_themes_insert_input!
    $invoice_details: team_invoice_details_insert_input!
  ) {
    insert_teams_one(
      object: {
        name: $name
        slug: $slug
        category: $category
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
  category: TeamCategory;
  settings: {
    isTrial: boolean;
  };
}

export const useCreateTeam = () => {
  const [mutate, mutationState] = useMutation(CREATE_TEAM_MUTATION);

  const createTeam = async ({
    name,
    slug,
    category,
    settings,
  }: TeamPayload) => {
    return mutate({
      variables: {
        name,
        slug,
        category,
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

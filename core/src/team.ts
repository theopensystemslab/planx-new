import { gql } from "graphql-request";
import type { GraphQLClient } from "graphql-request";

const defaultNotifyPersonalisation = {
  notify_personalisation: {
    helpEmail: "example@council.gov.uk",
    helpPhone: "(01234) 567890",
    emailReplyToId: "727d48fa-cb8a-42f9-b8b2-55032f3bb451",
    helpOpeningHours: "Monday - Friday, 9am - 5pm",
  },
};

const defaultSettings = {
  settings: {
    homepage: "https://example.com",
    externalPlanningSite: {
      url: "https://planningportal.co.uk",
      name: "Planning Portal",
    },
  },
};

export async function createTeam(
  client: GraphQLClient,
  args: {
    name: string;
    slug: string;
    logo: string;
    primaryColor: string;
    homepage: string;
  }
): Promise<number> {
  const input = {
    name: args.name,
    slug: args.slug,
    theme: {
      logo: args.logo,
      primary: args.primaryColor,
    },
    settings: {
      ...defaultSettings,
      homepage: args.homepage,
    },
    notify_personalisation: JSON.stringify({
      ...defaultNotifyPersonalisation,
    }),
  };
  const { insert_teams_one: response } = await client.request(
    gql`
      mutation CreateTeam(
        $name: String!
        $slug: String!
        $theme: jsonb!
        $settings: jsonb!
        $notify_personalisation: jsonb!
      ) {
        insert_teams_one(
          object: {
            name: $name
            slug: $slug
            theme: $theme
            settings: $settings
            notify_personalisation: $notify_personalisation
          }
        ) {
          id
        }
      }
    `,
    input
  );
  return response.id;
}

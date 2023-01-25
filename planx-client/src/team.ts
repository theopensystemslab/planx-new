import { Request } from "./graphql";
import log from "./logger";

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
  request: Request,
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
  log("createTeam input", input);
  let teamID;
  try {
    const { insert_teams_one: response } = await request(
      `mutation CreateTeam ($name: String!, $slug: String!, $theme: jsonb!, $settings: jsonb!, $notify_personalisation: jsonb!) {
        insert_teams_one(object: {
          name: $name, 
          slug: $slug, 
          theme: $theme, 
          settings: $settings, 
          notify_personalisation: $notify_personalisation
        }) {
          id
        }
      }`,
      input
    );
    teamID = response.id;
  } catch (e) {
    log(e);
    throw e;
  }
  return teamID;
}

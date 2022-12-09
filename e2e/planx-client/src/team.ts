import { Request } from "./graphql";
import defaultSettings from "./defaults/settings.json";
import defaultNotifyPersonalisation from "./defaults/notify.json";
import log from "./logger";

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

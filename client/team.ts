import { Request } from "./graphql";
import defaultSettings from "./defaults/settings.json";
import defaultNotifyPersonalisation from "./defaults/notify.json";

export async function createTeam(
  request: Request,
  args: {
    name: string;
    slug: string;
    logo: string;
    primaryColor: string;
    homepage: string;
  }
) {
  // create team record
  const { data, errors } = await request(
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
    {
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
      notify_personalisation: {
        ...defaultNotifyPersonalisation,
      },
    }
  );
  if (errors) throw new Error("ERROR: createTeam", errors);
  return { ...data.insert_teams_one };
}

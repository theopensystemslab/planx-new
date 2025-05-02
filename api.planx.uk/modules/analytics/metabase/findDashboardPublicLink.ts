// The dashboard links across Metabase staging and production are different, so we need to store and be able to access both depending on the environment
const DASHBOARD_PUBLIC_LINKS = {
  production: {
    discretionary:
      "https://metabase.editor.planx.uk/public/dashboard/868af689-f792-4820-8756-4aec92407b27?date=&service={service-slug}&tab=468-key-figures-and-overview&team={team-slug}",
    FOIYNPP:
      "https://metabase.editor.planx.uk/public/dashboard/f219818d-1076-4055-a35b-8be6e0ed4755?date=&device_type=&service={service-slug}&tab=474-key-figures-and-overview&team={team-slug}",
    RAB: "https://metabase.editor.planx.uk/public/dashboard/0f52eb76-8d7f-459a-8327-4374731f31a3?date=&service={service-slug}&tab=481-key-figures-and-overview&team={team-slug}",
    submission:
      "https://metabase.editor.planx.uk/public/dashboard/615885ed-b945-4dec-8e26-2826d4ecd27b?application_type=&date=&device_type=&service={service-slug}&tab=487-key-figures&team={team_slug}&user_type=",
  },
  staging: {
    discretionary:
      "https://metabase.editor.planx.dev/public/dashboard/0c0abafd-e919-4da2-a5b3-1c637f703954?service_slug={service-slug}&team_slug={team-slug}",
    FOIYNPP:
      "https://metabase.editor.planx.dev/public/dashboard/d6303f0b-d6e8-4169-93c0-f988a93e19bc?service_slug={service-slug}&team_slug={team-slug}",
    RAB: "https://metabase.editor.planx.dev/public/dashboard/85c120bf-39b0-4396-bf8a-254b885e77f5?service_slug={service-slug}&team_slug={team-slug}",
    submission:
      "https://metabase.editor.planx.dev/public/dashboard/363fd552-8c2b-40d9-8b7a-21634ec182cc?service_slug={service-slug}&team_slug={team-slug}",
  },
} as const;

const environment =
  process.env.APP_ENVIRONMENT === "production" ? "production" : "staging";

const FOIYNPP = {
  link: DASHBOARD_PUBLIC_LINKS[environment].FOIYNPP,
  slugs: [
    "check-if-you-need-planning-permission",
    "find-out-if-you-need-planning-permission",
  ],
};
const RAB = {
  link: DASHBOARD_PUBLIC_LINKS[environment].RAB,
  slugs: ["report-a-planning-breach"],
};
const submission = {
  link: DASHBOARD_PUBLIC_LINKS[environment].submission,
  slugs: [
    "apply-for-planning-permission",
    "apply-for-a-lawful-development-certificate",
    "pre-application",
  ],
};

const includedServices = [FOIYNPP, RAB, submission];
// TODO: figure out how to handle discretionary services
// const discretionaryDashboardTemplate = 118

export function findDashboardPublicLink(slug: string): string | null {
  for (const service of includedServices) {
    for (const serviceSlug of service.slugs) {
      if (slug.includes(serviceSlug)) {
        return service.link;
      }
    }
  }
  return null;
}

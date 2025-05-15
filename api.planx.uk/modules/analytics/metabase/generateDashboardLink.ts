// The dashboard links across Metabase staging and production are different, so we need to store and be able to access both
const DASHBOARD_PUBLIC_IDS = {
  production: {
    discretionary: "868af689-f792-4820-8756-4aec92407b27",
    FOIYNPP: "f219818d-1076-4055-a35b-8be6e0ed4755",
    RAB: "0f52eb76-8d7f-459a-8327-4374731f31a3",
    submission: "615885ed-b945-4dec-8e26-2826d4ecd27b"
  },
  staging: {
    discretionary: "0c0abafd-e919-4da2-a5b3-1c637f703954",
    FOIYNPP: "d6303f0b-d6e8-4169-93c0-f988a93e19bc",
    RAB: "85c120bf-39b0-4396-bf8a-254b885e77f5",
    submission: "363fd552-8c2b-40d9-8b7a-21634ec182cc",
  },
} as const;

type Environment = keyof typeof DASHBOARD_PUBLIC_IDS;

const environment =
  process.env.APP_ENVIRONMENT === "production" ? "production" : "staging";

const FOIYNPP = {
  id: DASHBOARD_PUBLIC_IDS[environment].FOIYNPP,
  slugs: [
    "check-if-you-need-planning-permission",
    "find-out-if-you-need-planning-permission",
  ],
};
const RAB = {
  id: DASHBOARD_PUBLIC_IDS[environment].RAB,
  slugs: ["report-a-planning-breach"],
};
const submission = {
  id: DASHBOARD_PUBLIC_IDS[environment].submission,
  slugs: [
    "apply-for-planning-permission",
    "apply-for-a-lawful-development-certificate",
    "pre-application",
  ],
};

const includedServices = [FOIYNPP, RAB, submission];
// TODO: figure out how to handle discretionary services
// const discretionaryDashboardTemplate = 118

export const generateDashboardLink = ({ environment, serviceSlug, teamSlug }: {
  environment: Environment;
  serviceSlug: string;
  teamSlug: string;
}): string | undefined => {

  let dashboardId: string | undefined;

  for (const service of includedServices) {
    const found = service.slugs.some(slug => serviceSlug.includes(slug));
    console.log(`Does "${serviceSlug}" contain any of`, service.slugs, '?', found);
    if (found) {
      console.log(`Found matching slug in "${serviceSlug}" for:`, service.slugs);
      dashboardId = service.id;
      break;
    }
  }

  if (!dashboardId) {
    return;
  }
  
  const baseDomain = environment === "production" ? "uk" : "dev";
  const host = `https://metabase.editor.planx.${baseDomain}`;
  const pathname = `/public/dashboard/${dashboardId}`;
  const url = new URL(pathname, host);
  const search =  new URLSearchParams({ service: serviceSlug, team: teamSlug }).toString();
  url.search = search;
  console.log({url})

  return url.toString();
}


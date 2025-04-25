// The template IDs across Metabase staging and production are different, so we need to store and be able to access both depending on the environment
const DASHBOARD_IDS = {
  production: {
    AFPP: 102,
    FOIYNPP: 73,
    LDC: 124,
    preApp: 120,
    RAB: 150,
  },
  staging: {
    AFPP: 185,
    FOIYNPP: 184,
    LDC: 178,
    preApp: 120,
    RAB: 183,
  },
} as const;

const environment =
  process.env.APP_ENVIRONMENT === "production" ? "production" : "staging";

const AFPP = {
  template: DASHBOARD_IDS[environment].AFPP,
  slugs: ["apply-for-planning-permission"],
};
const FOIYNPP = {
  template: DASHBOARD_IDS[environment].FOIYNPP,
  slugs: [
    "check-if-you-need-planning-permission",
    "find-out-if-you-need-planning-permission",
  ],
};
const LDC = {
  template: DASHBOARD_IDS[environment].LDC,
  slugs: ["apply-for-a-lawful-development-certificate"],
};
const preApp = {
  template: DASHBOARD_IDS[environment].preApp,
  slugs: ["pre-application"],
};
const RAB = {
  template: DASHBOARD_IDS[environment].RAB,
  slugs: ["report-a-planning-breach"],
};

const includedServices = [AFPP, FOIYNPP, LDC, preApp, RAB];
// TODO: figure out how to handle discretionary services
// const discretionaryDashboardTemplate = 118

export function findDashboardTemplate(slug: string): number | null {
  for (const service of includedServices) {
    for (const serviceSlug of service.slugs) {
      if (slug.includes(serviceSlug)) {
        return service.template;
      }
    }
  }
  return null;
}

const AFPP = {
  template: 102,
  slugs: ["apply-for-planning-permission"],
};
const FOIYNPP = {
  template: 73,
  slugs: [
    "check-if-you-need-planning-permission",
    "find-out-if-you-need-planning-permission",
  ],
};

const LDC = {
  template: 124,
  slugs: ["apply-for-a-lawful-development-certificate"],
};

const preApp = {
  template: 120,
  slugs: ["pre-application"],
};

const RAB = {
  template: 129,
  slugs: ["report-a-planning-breach"],
};

const includedServices = [AFPP, FOIYNPP, LDC, preApp, RAB];
// TODO: figure out how to handle discretionary services
// const discretionaryDashboardTemplate = 118

export async function findDashboardTemplate(
  slug: string,
): Promise<number | null> {
  for (const service of includedServices) {
    for (const serviceSlug of service.slugs) {
      if (slug.includes(serviceSlug)) {
        return service.template;
      }
    }
  }
  return null;
}

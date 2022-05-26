export const makeTitle = (str: string) =>
  [str, "PlanX"].filter(Boolean).join(" | ");

export const rootFlowPath = (includePortals = false) => {
  const path = window.location.pathname.split("/").slice(0, 3).join("/");
  return includePortals ? path : path.split(",")[0];
};

export const isExternalUrl = ["gov.uk", "opensystemslab.io"].find((domain) =>
  window.location.hostname.endsWith(domain)
);

export const externalTeamName = window.location.host.split(".")[1];

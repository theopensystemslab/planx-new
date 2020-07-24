export const makeTitle = (str: string) =>
  [str, "PlanX"].filter(Boolean).join(" | ");

export const rootFlowPath = (includePortals = false) => {
  const path = window.location.pathname.split("/").slice(0, 3).join("/");
  return includePortals ? path : path.split(",")[0];
};
